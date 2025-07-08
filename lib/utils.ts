// Get app name from env, fallback to default
export function getAppName() {
    return process.env.NEXT_PUBLIC_APP_NAME || "Linkku";
}
