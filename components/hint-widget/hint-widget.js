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
  'INDIVIDUAL': 'Индивидуальный предприниматель',
  'LEGAL': 'Организация'
}

class HintWidget extends HTMLElement {
  constructor() {
    super();
    this.setAttribute('suggestions', null);
    this.current = {
      shortName: this.getAttribute('shortName') || '',
      fullName: this.getAttribute('fullName') || '',
      inn: this.getAttribute('inn') || '',
      address: this.getAttribute('address') || '',
    }
  }

  // get placeholder() {
  //   return this.getAttribute("placeholder") || "";
  // }

  // get suggestions() {
  //   return this.hasAttribute("suggestions") && this.getAttribute("suggestions") !== "false";
  // }

  // set open(value) {
  //   value === true
  //     ? this.setAttribute("open", "")
  //     : this.removeAttribute("open");
  // }
  
  
  static get observedAttributes() {
    return ['query', 'suggestions'];
  }

  fetchSuggestions = async (e) => {
      fetch(url, {
        ...options,
        body: JSON.stringify({
          query: e.target.value,
          count: 5,
          type: "PARTY",
        }),
        }
      )
      .then(response => response.text())
      .then(result => {
        const data = JSON.parse(result).suggestions;
        this.setAttribute('suggestions', JSON.stringify([...data]));
      })
      .catch(error => console.log("error", error));
  }

  connectedCallback () {
    this.render();
    setTimeout(() => {
      document.querySelector('#party').addEventListener('change', this.fetchSuggestions);
    });
  }

  
  render() {
    console.log('render');
    const { shortName, fullName, inn, address} = this.current;
    const data = JSON.parse(this.getAttribute('suggestions'));
    console.log(data);
    data?.forEach(item => {
      const li = document.createElement('li');
      item.innerHTML = item.value;
      this.querySelector('.suggestions')?.appendChild(li);
    })

    this.innerHTML = `
    <style>
      @import "/components/hint-widget/hint-widget.css";
    </style>
    <section class="container">
      <p><strong>Компания или ИП</strong></p>
      <input id="party" name="party" type="text" placeholder="Введите название, ИНН, ОГРН или адрес организации" />
      ${this.suggestions && `<ul class="suggestions">${suggestionElems}<ul>`}
    </section>

    <section class="result">
      <p id="type"></p>
      <div class="row">
        <label>Краткое наименование</label>
        <input id="name_short" value=${shortName}>
      </div>
      <div class="row">
        <label>Полное наименование</label>
        <input id="name_full" value=${fullName}>
      </div>
      <div class="row">
        <label>ИНН / КПП</label>
        <input id="inn_kpp" value=${inn}>
      </div>
      <div class="row">
        <label>Адрес</label>
          <input id="address value=${address}">
      </div>
    </section>
    `;
  }
  // Whenever an attibute is changed, this function is called. A switch statement is a good way to handle the various attributes.
  // Note that this also gets called the first time the attribute is set, so we do not need any special initialisation code.
  attributeChangedCallback() {
    this.render();
  }
  // attributeChangedCallback(name, oldValue, newValue) {
  //   switch(name) {
  //     case 'author':
  //       this.querySelector('.author').innerText = newValue;
  //       this.querySelector('.message').classList.toggle('self', newValue === 'Me');
  //       break;
  //     case 'profile-photo':
  //       this.querySelector('.profile-photo').setAttribute('src', newValue);
  //       break;
  //     case 'message-text':
  //       this.querySelector('.message-text').innerText = newValue;
  //       break;
  //     case 'time':
  //       this.querySelector('time').innerText = newValue;
  //       break;
  //   }
  // }
  

}

// Now that our class is defined, we can register it
customElements.define('hint-widget', HintWidget);


function join(arr /*, separator */) {
  var separator = arguments.length > 1 ? arguments[1] : ", ";
  return arr.filter(function(n){return n}).join(separator);
}

function showSuggestion(suggestion) {
  console.log(suggestion);
  var data = suggestion.data;
  if (!data)
    return;
  
  // $("#type").value =
  //   TYPES[data.type] + " (" + data.type + ")"


  // if (data.name) {
  //   $("#name_short").val(data.name.short_with_opf || "");
  //   $("#name_full").val(data.name.full_with_opf || "");
  // }
    
  // $("#inn_kpp").val(join([data.inn, data.kpp], " / "));
  
  // if (data.address) {
  //   var address = "";
  //   if (data.address.data.qc == "0") {
  //     address = join([data.address.data.postal_code, data.address.value]);
  //   } else {
  //     address = data.address.data.source;
  //   }
  //   $("#address").val(address);
  // }
}

// $("#party").suggestions({
//   token: token,
//   type: "PARTY",
//   count: 5,
//   /* Вызывается, когда пользователь выбирает одну из подсказок */
//   onSelect: showSuggestion
// });