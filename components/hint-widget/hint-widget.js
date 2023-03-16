let url = "https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/party";
let token = "6d76298211a535bf27399df048db36a5c9cc6124";

let options = {
  method: "POST",
  mode: "cors",
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
    "Authorization": "Token " + token
  },
}

const TYPES = {
  "INDIVIDUAL": "Индивидуальный предприниматель",
  "LEGAL": "Организация",
}

const template = document.createElement("template");
template.innerHTML = `
  <style>
    @import "/components/hint-widget/hint-widget.css";
  </style>
  <div class="hint-widget">
    <section class="search">
      <p><strong>Компания или ИП</strong></p>
      <input id="party" name="party" type="text" placeholder="Введите название, ИНН, ОГРН или адрес организации" />
      <ul class="suggestions">
    </section>

    <section class="result">
      <p id="type"></p>
      <div class="row">
        <label>Краткое наименование</label>
        <input id="name_short">
      </div>
      <div class="row">
        <label>Полное наименование</label>
        <input id="name_full">
      </div>
      <div class="row">
        <label>ИНН / КПП</label>
        <input id="inn_kpp">
      </div>
      <div class="row">
        <label>Адрес</label>
          <input id="address">
      </div>
    </section>
  </div>
`;

class HintWidget extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({mode: "open"});
    this.shadowRoot.appendChild(template.content.cloneNode(true))
    this._suggestions = [];
    this.isOverList = false;

    this.searchEl = this.shadowRoot.querySelector("#party");
    this.suggestionsEl = this.shadowRoot.querySelector(".suggestions");
    this.typeEl = this.shadowRoot.querySelector("#type");
    this.nameShortEl = this.shadowRoot.querySelector("#name_short");
    this.nameFullEl = this.shadowRoot.querySelector("#name_full");
    this.innEl = this.shadowRoot.querySelector("#inn_kpp");
    this.addressEl = this.shadowRoot.querySelector("#address");
    }

  set suggestions(value) {
    this._suggestions = [...value];
  }
  get suggestions() {
    return this._suggestions;
  }

  static get observedAttributes() {
    return ["open", "query"];
  }

  fetchSuggestions = async (query) => {
      fetch(url, {
        ...options,
        body: JSON.stringify({
          query: query,
          count: 5,
        }),
        }
      )
      .then(response => response.text())
      .then(result => {
        const data = JSON.parse(result).suggestions;
        this.suggestions = [...data];
        this.setAttribute("open", true);
        this.setAttribute("query", query);

      })
      .catch(error => console.log("error", error));
  }

  async handleInput  (e) {
    const query = e.target.value;
    if (query) { 
      this.fetchSuggestions(query);
    } else {
      this.setAttribute("open", false);
      this.setAttribute("query", "");
    }
  }

  connectedCallback () {
    setTimeout(() => {
      this.searchEl.addEventListener("input", this.handleInput.bind(this));
      this.searchEl.addEventListener("blur", () => {
        if (!this.isOverList) this.setAttribute("open", false);
      });
      this.searchEl.addEventListener("focus", () => {
        if (this.getAttribute("query")) this.setAttribute("open", true);
      });
    });
  }

  renderSuggestions() {
    this.suggestionsEl.innerHTML = "";
    if (this.suggestions.length > 0) {
      const hint = document.createElement("p");
      hint.className = "suggestions__hint";
      hint.innerHTML = "Выберите вариант или продолжите ввод";
      this.suggestionsEl.appendChild(hint);

      this.suggestions.forEach((item) => {
        const li = document.createElement("li");
        li.className = "suggestions__item";
        const title = document.createElement("p");
        title.className = "title";
        title.innerHTML = item.value;
        const info = document.createElement("p");
        info.className = "info";
        info.innerHTML = item.data.inn + " " + item.data.address.value;
        
        li.appendChild(title);
        li.appendChild(info);

        li.addEventListener("click", () => this.handleSelect(item.data));
        this.suggestionsEl.appendChild(li);
        this.suggestionsEl.addEventListener("mouseover", () => this.isOverList = true);
        this.suggestionsEl.addEventListener("mouseleave", () => this.isOverList = false)
      });
    }
  }

  toggleOpen () {
    this.suggestionsEl.style.display = this.getAttribute("open") ==="true" ? "block" : "none";
  }

  handleSelect(data) {
    if (!data) return;

    this.typeEl.innerHTML = TYPES[data.type] + " (" + data.type + ")";

    this.searchEl.value = data.name.short_with_opf;
    if (data.name) {
      this.nameShortEl.value = data.name.short_with_opf || "";
      this.nameFullEl.value = data.name.full_with_opf || "";
    }
  
    this.innEl.value = [data.inn, data.kpp].join(" / ");

    if (data.address) {
      var address = "";
      if (data.address.data.qc == "0") {
        address = [data.address.data.postal_code, data.address.value].join(", ");
      } else {
        address = data.address.data.source;
      }
      this.addressEl.value = address;
    }
    this.setAttribute("query", "");
    this.setAttribute("open", false);
  }

  attributeChangedCallback(name) {
    switch(name) {
      case "open":
        this.toggleOpen();
        break;
      case "query":
        this.renderSuggestions();
        break;
    }
  }
}

customElements.define("hint-widget", HintWidget);
