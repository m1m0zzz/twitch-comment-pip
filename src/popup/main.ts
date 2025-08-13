// console.log("hello from popup")

const isSupported = 'documentPictureInPicture' in window

async function contentScript() {
  // console.log("hello from pseudo content script")
  const pipContent = document.querySelector("[data-a-target='chat-scroller']")!
  const container = pipContent.parentElement!
  const pipWindow = await documentPictureInPicture.requestWindow({
    preferInitialWindowPlacement: true
  })
  // Copy style sheets over from the initial document
  // so that the player looks the same.
  for (let i = 0; i < document.styleSheets.length; i++) {
    const styleSheet = document.styleSheets.item(i)!
    try {
      const cssRules = [...styleSheet.cssRules].map((rule) => rule.cssText).join('')
      const style = document.createElement('style')

      style.textContent = cssRules
      pipWindow.document.head.appendChild(style)
    } catch (e) {
      const link = document.createElement('link')

      link.rel = 'stylesheet'
      link.type = styleSheet.type
      // @ts-ignore
      link.media = styleSheet.media
      // @ts-ignore
      link.href = styleSheet.href
      pipWindow.document.head.appendChild(link)
    }
  }

  pipWindow.document.body.append(pipContent)

  pipWindow.addEventListener("pagehide", () => {
    container.append(pipContent)
  })
}

const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
chrome.scripting.executeScript({
  target: {tabId: tab.id!},
  func: contentScript
})

document.querySelector('#app')!.innerHTML = `
  <div>${isSupported ? "popup comment!" : "Picture in Picture is not supported this browser."}</div>
`
