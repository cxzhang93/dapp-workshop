import { createProject } from './project.mjs';
import { serve, integer } from './runtime.mjs';
const project = await createProject();
try {
  const app = await serve(project, integer(process.env.PORT || 4182, 'Port', 1024, 65535));
  let closing = false;
  async function close() { if (closing) return; closing=true; await app.close(); process.exit(0); }
  process.on('SIGINT', close); process.on('SIGTERM', close);
} catch (error) {
  await project.chain.close();
  console.error(error.code==='EADDRINUSE' ? 'Port is in use. Stop the existing demo or choose PORT=another_number.' : error);
  process.exitCode=1;
}
