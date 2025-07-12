// src/utils/createTestUsers.ts
// Run this script to create test users for your TimeLink application

import { createUserWithEmailAndPassword, updateProfile, sendEmailVerification } from "firebase/auth";
import { auth } from "@/components/firebase";
import { OrganizationService } from "@/services/organizationService";
import { UserService } from "@/services/userService";
import { InvitationService } from "@/services/invitationService";

interface TestUser {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'manager' | 'employee';
  department?: string;
}

interface TestOrganization {
  name: string;
  email: string;
  industry: string;
  admin: TestUser;
  managers: TestUser[];
  employees: TestUser[];
}

const testOrganizations: TestOrganization[] = [
  {
    name: "Acme Construction Co.",
    email: "admin@acmeconstruction.com",
    industry: "construction",
    admin: {
      email: "admin@acmeconstruction.com",
      password: "admin123",
      firstName: "John",
      lastName: "Smith",
      role: "admin"
    },
    managers: [
      {
        email: "manager1@acmeconstruction.com",
        password: "manager123",
        firstName: "Sarah",
        lastName: "Johnson",
        role: "manager",
        department: "Field Operations"
      },
      {
        email: "manager2@acmeconstruction.com",
        password: "manager123",
        firstName: "Mike",
        lastName: "Wilson",
        role: "manager",
        department: "Safety"
      }
    ],
    employees: [
      {
        email: "employee1@acmeconstruction.com",
        password: "employee123",
        firstName: "David",
        lastName: "Brown",
        role: "employee",
        department: "Field Operations"
      },
      {
        email: "employee2@acmeconstruction.com",
        password: "employee123",
        firstName: "Lisa",
        lastName: "Davis",
        role: "employee",
        department: "Field Operations"
      },
      {
        email: "employee3@acmeconstruction.com",
        password: "employee123",
        firstName: "Tom",
        lastName: "Anderson",
        role: "employee",
        department: "Safety"
      }
    ]
  },
  {
    name: "TechStart Solutions",
    email: "admin@techstart.com",
    industry: "technology",
    admin: {
      email: "admin@techstart.com",
      password: "admin123",
      firstName: "Emily",
      lastName: "Chen",
      role: "admin"
    },
    managers: [
      {
        email: "manager1@techstart.com",
        password: "manager123",
        firstName: "Alex",
        lastName: "Rodriguez",
        role: "manager",
        department: "Engineering"
      }
    ],
    employees: [
      {
        email: "employee1@techstart.com",
        password: "employee123",
        firstName: "Jessica",
        lastName: "Thompson",
        role: "employee",
        department: "Engineering"
      },
      {
        email: "employee2@techstart.com",
        password: "employee123",
        firstName: "Ryan",
        lastName: "Martinez",
        role: "employee",
        department: "Engineering"
      }
    ]
  }
];

export class TestUserCreator {
  
  static async createTestOrganizations(): Promise<void> {
    console.log("🚀 Starting test user creation...");
    
    for (const org of testOrganizations) {
      try {
        console.log(`\n📋 Creating organization: ${org.name}`);
        
        // Step 1: Create admin user and organization
        const adminUserId = await this.createAdminUser(org.admin, org);
        console.log(`✅ Admin user created: ${org.admin.email}`);
        
        // Step 2: Get the organization ID
        const adminUser = await UserService.getCurrentUser();
        if (!adminUser?.organizationId) {
          throw new Error("Failed to get organization ID");
        }
        
        const organizationId = adminUser.organizationId;
        
        // Step 3: Create managers through invitation
        for (const manager of org.managers) {
          await this.createInvitedUser(manager, organizationId, adminUserId);
          console.log(`✅ Manager created: ${manager.email}`);
        }
        
        // Step 4: Create employees through invitation
        for (const employee of org.employees) {
          await this.createInvitedUser(employee, organizationId, adminUserId);
          console.log(`✅ Employee created: ${employee.email}`);
        }
        
        console.log(`🎉 Organization "${org.name}" setup complete!`);
        
      } catch (error) {
        console.error(`❌ Error creating organization "${org.name}":`, error);
      }
    }
    
    console.log("\n🎊 All test organizations created!");
    this.printLoginCredentials();
  }
  
  private static async createAdminUser(
    adminData: TestUser, 
    orgData: TestOrganization
  ): Promise<string> {
    // Create Firebase auth user
    const userCred = await createUserWithEmailAndPassword(
      auth, 
      adminData.email, 
      adminData.password
    );
    
    // Update display name
    await updateProfile(userCred.user, {
      displayName: `${adminData.firstName} ${adminData.lastName}`
    });
    
    // Create organization
    const organizationId = await OrganizationService.createOrganization({
      name: orgData.name,
      email: orgData.email,
      industry: orgData.industry,
    });
    
    // Create admin user document
    await UserService.createAdminUser(userCred.user, organizationId, {
      firstName: adminData.firstName,
      lastName: adminData.lastName,
    });
    
    // Send verification email
    await sendEmailVerification(userCred.user);
    
    return userCred.user.uid;
  }
  
  private static async createInvitedUser(
    userData: TestUser,
    organizationId: string,
    invitedBy: string
  ): Promise<void> {
    // Create invitation
    const token = await InvitationService.createInvitation({
      organizationId,
      email: userData.email,
      role: userData.role as 'manager' | 'employee',
      invitedBy,
      invitedByName: "Test Admin",
      firstName: userData.firstName,
      lastName: userData.lastName,
      department: userData.department,
    });
    
    // Get the invitation
    const invitation = await InvitationService.getInvitationByToken(token);
    if (!invitation) {
      throw new Error("Failed to create invitation");
    }
    
    // Create Firebase auth user
    const userCred = await createUserWithEmailAndPassword(
      auth,
      userData.email,
      userData.password
    );
    
    // Update display name
    await updateProfile(userCred.user, {
      displayName: `${userData.firstName} ${userData.lastName}`
    });
    
    // Create user from invitation
    await UserService.createUserFromInvitation(userCred.user, invitation, {
      firstName: userData.firstName,
      lastName: userData.lastName,
    });
    
    // Accept the invitation
    await InvitationService.acceptInvitation(invitation.id);
    
    // Send verification email
    await sendEmailVerification(userCred.user);
  }
  
  private static printLoginCredentials(): void {
    console.log("\n" + "=".repeat(60));
    console.log("🔑 TEST USER LOGIN CREDENTIALS");
    console.log("=".repeat(60));
    
    testOrganizations.forEach((org, index) => {
      console.log(`\n${index + 1}. ${org.name}`);
      console.log("-".repeat(40));
      
      console.log(`👑 ADMIN:`);
      console.log(`   Email: ${org.admin.email}`);
      console.log(`   Password: ${org.admin.password}`);
      
      console.log(`👔 MANAGERS:`);
      org.managers.forEach(manager => {
        console.log(`   Email: ${manager.email}`);
        console.log(`   Password: ${manager.password}`);
        console.log(`   Department: ${manager.department}`);
      });
      
      console.log(`👷 EMPLOYEES:`);
      org.employees.forEach(employee => {
        console.log(`   Email: ${employee.email}`);
        console.log(`   Password: ${employee.password}`);
        console.log(`   Department: ${employee.department}`);
      });
    });
    
    console.log("\n" + "=".repeat(60));
    console.log("📝 NOTE: All users need to verify their email addresses");
    console.log("         before they can log in successfully.");
    console.log("=".repeat(60));
  }
  
  // Helper method to create sample time logs for testing
  static async createSampleTimeLogs(): Promise<void> {
    console.log("\n⏰ Creating sample time logs...");
    
    // This would require importing TimeTrackingService
    // and creating some sample clock in/out entries
    // for testing the time tracking functionality
    
    console.log("✅ Sample time logs created");
  }
}

// Usage example:
// TestUserCreator.createTestOrganizations();