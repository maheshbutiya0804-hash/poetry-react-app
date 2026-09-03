declare module 'unzipper' {
  type ZipEntry = { path: string; type: 'File' | 'Directory'; buffer(): Promise<Buffer> }
  const unzipper: { Open: { file(path: string): Promise<{ files: ZipEntry[] }> } }
  export default unzipper
}
