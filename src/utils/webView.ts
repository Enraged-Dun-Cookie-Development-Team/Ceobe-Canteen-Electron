import { http } from "@tauri-apps/api";
import { ResponseType } from "@tauri-apps/api/http";

class WebView extends HTMLIFrameElement {
  static get observedAttributes() {
    return ["src", "style", "useragent", "class"];
  }

  constructor() {
    super();
    console.log("created Webview");
  }
  onloadstart = () => {
    const url = new URL(this.src);
    this.contentDocument!.domain = url.host;
  };
  attributeChangedCallback() {
    this.load(this.src);
  }

  load(url: string, options?: any) {
    if (!url || !url.startsWith("http"))
      throw new Error(
        `X-Frame-Bypass src ${url} does not start with http(s)://`,
      );
    console.log("X-Frame-Bypass loading:", url);
    this.srcdoc = `<html>
<head>
	<style>
	.loader {
		position: absolute;
		top: calc(50% - 25px);
		left: calc(50% - 25px);
		width: 50px;
		height: 50px;
		background-color: #333;
		border-radius: 50%;  
		animation: loader 1s infinite ease-in-out;
	}
	@keyframes loader {
		0% {
		transform: scale(0);
		}
		100% {
		transform: scale(1);
		opacity: 0;
		}
	}
	</style>
</head>
<body>
	<div class="loader"></div>
</body>
</html>`;
    this.fetchProxy(url, options, 0)
      .then((res) => res.text())
      .then((data) => {
        if (data)
          this.srcdoc = data.replace(
            /<head([^>]*)>/i,
            `<head$1>
	<base href="${url}">
	<script>
	// X-Frame-Bypass navigation event handlers
	document.addEventListener('click', e => {
		if (frameElement && document.activeElement && document.activeElement.href) {
			e.preventDefault()
			frameElement.load(document.activeElement.href)
		}
	})
	document.addEventListener('submit', e => {
		if (frameElement && document.activeElement && document.activeElement.form && document.activeElement.form.action) {
			e.preventDefault()
			if (document.activeElement.form.method === 'post')
				frameElement.load(document.activeElement.form.action, {method: 'post', body: new FormData(document.activeElement.form)})
			else
				frameElement.load(document.activeElement.form.action + '?' + new URLSearchParams(new FormData(document.activeElement.form)))
		}
	})
	</script>`,
          );
      })
      .catch((error: any) =>
        console.error("Cannot load X-Frame-Bypass:", error),
      );
  }

  private async fetchProxy(
    url: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _options: RequestInit | undefined,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _number: number,
  ) {
    // const u = new URL(url);
    const resp = await http.fetch<string>(url, {
      method: "GET",
      responseType: ResponseType.Text,
    });
    //     let options:RequestInit = {
    //         mode:"no-cors",
    //         headers:{
    //             "User-Agent":this.useragent
    //         }
    //     }
    //     console.log(options.headers)
    // let response = await fetch(url,options)
    console.log(resp);
    // let body = new Blob(resp.data,{type:resp.headers["content-type"]})
    // console.log(body)
    const response = new Response(resp.data, {
      headers: resp.headers,
      status: resp.status,
      statusText: resp.status.toString(),
    });

    console.log(response);
    response.headers.delete("X-Frame-Options");
    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`);
    }
    console.log(response);
    return response;
  }
}

customElements.define("ceobe-webview", WebView, { extends: "iframe" });
