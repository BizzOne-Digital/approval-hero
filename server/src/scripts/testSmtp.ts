import { getSmtpStatus } from '../services/emailService';

async function main() {
  const status = await getSmtpStatus();
  console.log(JSON.stringify(status, null, 2));
  process.exit(status.connected ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
