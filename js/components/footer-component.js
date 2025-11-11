
class FooterComponent extends HTMLElement{
    connectedCallback(){ this.innerHTML=`<footer style="text-align:center;padding:16px;color:#666">© 2025 LMS ABC</footer>`; }
}
customElements.define('footer-component',FooterComponent);