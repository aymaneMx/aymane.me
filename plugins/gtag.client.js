import { isGa4MeasurementId } from '@/utils/site'

export default ({ app, $config }) => {
  const id = $config.googleAnalyticsId
  if (!isGa4MeasurementId(id)) {
    return
  }

  window.dataLayer = window.dataLayer || []
  window.gtag = function gtag () {
    window.dataLayer.push(arguments)
  }
  window.gtag('js', new Date())
  window.gtag('config', id, { send_page_view: false })

  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`
  document.head.appendChild(script)

  const sendPageView = (to) => {
    window.gtag('event', 'page_view', {
      page_path: to.fullPath,
      page_location: `${window.location.origin}${to.fullPath}`
    })
  }

  sendPageView(app.router.currentRoute)
  app.router.afterEach((to) => {
    sendPageView(to)
  })
}
