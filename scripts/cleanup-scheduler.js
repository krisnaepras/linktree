const { cleanupUnusedImages } = require("./cleanup-unused-images");

// Fungsi untuk menjalankan cleanup terjadwal
async function scheduledCleanup() {
    console.log("🕐 Starting scheduled cleanup...");

    try {
        // Jalankan dry run terlebih dahulu
        console.log("🔍 Running dry run first...");
        await cleanupUnusedImages(true);

        // Tunggu 5 detik
        await new Promise((resolve) => setTimeout(resolve, 5000));

        // Jalankan cleanup actual
        console.log("🧹 Running actual cleanup...");
        await cleanupUnusedImages(false);

        console.log("✅ Scheduled cleanup completed successfully!");
    } catch (error) {
        console.error("❌ Scheduled cleanup failed:", error);
    }
}

// Fungsi untuk menjalankan cleanup berdasarkan interval
function startCleanupScheduler(intervalHours = 24) {
    console.log(
        `🔄 Cleanup scheduler started - runs every ${intervalHours} hours`
    );

    // Jalankan cleanup pertama kali
    scheduledCleanup();

    // Jalankan cleanup setiap interval yang ditentukan
    setInterval(scheduledCleanup, intervalHours * 60 * 60 * 1000);
}

// Jalankan cleanup segera jika diminta
if (process.argv.includes("--now")) {
    console.log("🚀 Running immediate cleanup...");
    scheduledCleanup();
} else if (process.argv.includes("--schedule")) {
    const intervalArg = process.argv.find((arg) => arg.startsWith("--hours="));
    const hours = intervalArg ? parseInt(intervalArg.split("=")[1]) : 24;
    startCleanupScheduler(hours);
} else {
    console.log("Usage:");
    console.log(
        "  node scripts/cleanup-scheduler.js --now              # Run once immediately"
    );
    console.log(
        "  node scripts/cleanup-scheduler.js --schedule         # Run every 24 hours"
    );
    console.log(
        "  node scripts/cleanup-scheduler.js --schedule --hours=12  # Run every 12 hours"
    );
}

module.exports = { scheduledCleanup, startCleanupScheduler };
