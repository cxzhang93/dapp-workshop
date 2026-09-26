// Give each long-running service its own process group. npm/Yarn/Next spawn
// children; killing only the shell wrapper leaves their ports occupied.
import { spawn } from "node:child_process";

const [cwd, command, ...args] = process.argv.slice(2);
const child = spawn(command, args, { cwd, stdio: "inherit", detached: true });
let stopping = false;
function stop(signal, exitCode = signal === "SIGINT" ? 130 : 143) {
  if (stopping) return;
  stopping = true;
  try { process.kill(-child.pid, signal); } catch (error) {
    if (error.code !== "ESRCH") throw error;
  }
  // Bound shutdown even if a development-server descendant ignores SIGTERM.
  setTimeout(() => {
    try { process.kill(-child.pid, "SIGKILL"); } catch (error) {
      if (error.code !== "ESRCH") throw error;
    }
    process.exit(exitCode);
  }, 2000);
}
process.on("SIGINT", () => stop("SIGINT"));
process.on("SIGTERM", () => stop("SIGTERM"));
child.on("error", error => { console.error(error); process.exit(1); });
child.on("exit", code => {
  if (!stopping) {
    // Also reap descendants if the top-level command exits unexpectedly.
    stop("SIGTERM", code ?? 1);
  }
});
