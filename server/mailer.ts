
export async function sendOtp(identifier: string, code: string) {
    console.log("-----------------------------------------");
    console.log(`SENDING OTP TO: ${identifier}`);
    console.log(`CODE: ${code}`);
    console.log("-----------------------------------------");

    // In a real app, you'd use something like:
    // if (identifier.includes('@')) {
    //   await sendEmail(identifier, "Your Verification Code", `Your code is: ${code}`);
    // } else {
    //   await sendSms(identifier, `Your VillagerSponsor code is: ${code}`);
    // }
}
