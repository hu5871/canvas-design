export const isWindows = () => {
  return (
    navigator.platform.toLowerCase().includes('win') ||
    navigator.userAgent.includes('Windows')
  );
};