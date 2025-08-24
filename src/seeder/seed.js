const User = require("../modules/User/user.model");

const bcrypt = require("bcryptjs");


const adminEmail = process.env.ADMIN_EMAIL;
const adminPassword = process.env.ADMIN_PASSWORD;

const seedAdmin = async () => {
  try {
    const existingAdmin = await User.findOne({ role: "admin" });

    if (!existingAdmin) {
      await User.create({
        fullName: "Admin",
        email: adminEmail,
        password: adminPassword,
        role: "admin",  
      });

      console.log("✅ Admin user created successfully.");
    } else {
      console.log("✅ Admin user already exists.");
    }
  } catch (error) {
    console.error("❌ Error creating admin user:", error);
  }
};

module.exports = {
  seedAdmin
}

