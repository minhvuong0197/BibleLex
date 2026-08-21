// Workaround: in some sandboxed environments os.networkInterfaces() (getifaddrs)
// throws ERR_SYSTEM_ERROR (errno 13), which Next.js calls while printing the
// local/network URLs on server start and crashes the process. This preload makes
// it fail-safe: when the syscall is blocked we return an empty interface map so
// Next falls back to localhost. On normal machines this is a no-op.
const os = require("os");
const original = os.networkInterfaces;
os.networkInterfaces = function () {
  try {
    return original.call(this);
  } catch (e) {
    return {};
  }
};
