const { pathname, search } = window.location
const experience = new URLSearchParams(search).get('experience')

if (/^\/epub\/?$/.test(pathname) || experience === 'motion') {
  void import('./legacy-main')
} else {
  void import('./reading-fun/main')
}
