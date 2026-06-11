const mongoose = require("mongoose");
async function run() {
  // Test if the original srv URI works when using family: 4 option
  const uri = "mongodb+srv://lowanshidisha_db_user:CampusConnect2028@campus-connect.eaud2cj.mongodb.net/campusconnect";
  
  console.log("Connecting to:", uri);
  try {
    await mongoose.connect(uri, { 
      serverSelectionTimeoutMS: 5000,
      family: 4 // Force IPv4
    });
    console.log("✅ SUCCESS! Mongoose connected successfully with SRV!");
  } catch (err) {
    console.error("❌ FAILED! SRV connection failed:");
    console.error(err.message);
  }
  process.exit(0);
}
run();