class CalcController {
  constructor() {
    // utilizado this, para referenciar o atributo e métodos
    // querySelector => Retorna o primeiro elemento corresponde ao seletor especificado (# - id; . -). 
    this._locale = 'pt-BR'
    this._timeEl = document.querySelector('#hora');
    this._dateEl = document.querySelector('#data');
    this._displayCalcEl =  document.querySelector('#display');
    // armazena toda a opeção [ 1 + 2 - 3 / 5]
    this._operation = []
    // armazena a ultima operação informada
    this._lastOperator = '';
    // aramazena o ultimo número ou resultado do ultimo calculo
    this._lastNumber = ''
    this._audioOnOff = false;
    this._audio = new Audio('click.mp3');
    this._currentDate;
    this.initialize();
  }

  get displayTime() {
    return this._timeEl.innerHTML;
  }

  set displayTime(newValue) {
    return this._timeEl.innerHTML = newValue;
  }

  get displayDate() {
    return this._dateEl.innerHTML;
  }

  set displayDate(newDate) {
    return this._dateEl.innerHTML = newDate
  }

  get currentDate() {
    return new Date();
  }

  set currentDate(newValue) {
    this._currentDate = newValue;
  }

  get displayCalc() {
    return this._displayCalcEl.innerHTML;
  }

  set displayCalc(newValue) {
    if(newValue.toString().length > 10) {
      this.setError();
      return false;
    }

    this._displayCalcEl.innerHTML = newValue;
  }

  // metodos acionados no start da aplicação
  initialize() {
    this.setDisplayDateTime();
    // Atualiza a data e hora a cada segundo (1s => 1000 milissegundos)
    setInterval(() => {
      this.setDisplayDateTime();
    }, 1000);

    // Ativa o audio quando acionar dois clicks
    document.querySelectorAll('.btn-ac').forEach(btn => {
      btn.addEventListener('dblclick', event => {
        this.toggleAudio();
        console.log(toggleAudio)
      })
    });

    this.setLastNumberToDisplay();
    this.initButtonsEvents();
    this.initKeyboard();
    this.pastFromClipboard()
  }

  // inverte a chave do audio
  toggleAudio() {
    this._audioOnOff = !this._audioOnOff;
  }

  // aciona o audio
  playAudio() {
    if(this._audioOnOff) {
      this._audio.currentTime = 0;
      this._audio.play();
    }
  }

  // insere os eventos nos botões
  initButtonsEvents() {
    // seleciona todas as tag g filhas de buttons
    let buttons = document.querySelectorAll('#buttons > g, #parts > g');
    
    // forEach => executa um loop de acordo com o tamanho do array
    buttons.forEach((btn, _) => {
      this.addEventListenerAll(btn, 'click drag ', e => {
      let textBtn = btn.className.baseVal.replace('btn-', '');
    
      this.acaoBtn(textBtn);
      });
    
      this.addEventListenerAll(btn, "mouseover mouseup mousedpwn", e => {
        // insere o curso como mão para sinalizar ação
        btn.style.cursor = "pointer";
      });
    });
  }

  // captura eventos do teclado
  initKeyboard() {
    document.addEventListener('keyup', event => {
      this.playAudio();

      switch (event.key) {
        case 'Escape':
          this.clearAll();
          break;
        case 'Backspace':
          this.clearEntry();
          break;
        case '%':
        case '/':
        case '*':
        case '-':
        case '+':
          this.addOperation(event.key);
          break;
        case 'Enter':
        case '=':
          this.calc();
          break;
        case '.':
        case ',':
          this.addDot();
          break;
        case '0':
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
        case '9':
          this.addOperation(parseInt(event.key))
          break;
        case 'c':
          if(event.ctrlKey) this.copyToClipboard();
          break;
      }
    });
  }

  // copia para área de Transferência
  copyToClipboard() {
    // cria o elemento input para ter o dado a ser copiado
    let input = document.createElement('input');
    // insere o cado no atributo
    input.value = this.displayCalc;
    // insere o elemento no corpo do html
    document.body.appendChild(input);
    // sleciona o conteúdo
    input.select();

    document.execCommand('Copy');

    input.remove();
  }

  // colar da área de Transferência
  pastFromClipboard() {
    document.addEventListener('paste', event => {
      let text = event.clipboardData.getData('Text');

      this.displayCalc = parseFloat(text)
    })
  }

  // insere os dados de data e hora
  setDisplayDateTime() {
    this.displayDate = this.currentDate.toLocaleDateString(this._locale, {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
    this.displayTime = this.currentDate.toLocaleTimeString(this._locale);
  }

  // cria multiplos eventos para qualquer elemento
  addEventListenerAll(element, events, fn) {
    // split => cria uma array com base no separador informado
    events.split(' ').forEach(event => {
      element.addEventListener(event, fn, false );
    })
  }

  // limpa todos os dados da calculadora
  clearAll() {
    this._operation = [];
    this._lastNumber = '';
    this._lastOperator = '';

    this.setLastNumberToDisplay();
  }

  // limpa o ultimo registro
  clearEntry() {
    this._operation.pop();

    this.setLastNumberToDisplay();
  }

  // retorna o ultimo dado do array
  getLastOperation() {
    return this._operation[this._operation.length -1];
  }

  // Altera o dado pelo atual informado
  setLastOperation(newValue) {
    this._operation[this._operation.length -1] = newValue;
  }

  // verifica se o dado é uma operação
  isOperation(value) {
    // indexOf => retorna o index do elemento se encontrar, se caso falso retorna -1
    return (['+','-', '*', '%', '/'].indexOf(value) > -1); 
  }

  // retorna o valor calculado
  getResultCalc() {
    try {
      // eval => força o calculo dos dados em string
      return eval(this._operation.join(''));
    } catch (error) {
      setTimeout(() => {
        this.setError();
      }, 1);
    }
  }

  // realiza o calculo (2 dados, mais operacao)
  calc() {
    let last = '';
    let result = '';

    this._lastOperator = this.getLastItem();

    if(this._operation.length < 3) {

      let firstItem = this._operation[0];
      this._operation = [firstItem, this._lastOperator, this._lastNumber]
    }

    if (this._operation.length > 3) {
      // retira o ultimo operador
      last = this._operation.pop();

      this._lastNumber = this.getResultCalc();
    } 
    else if (this._operation.length == 3) {
      this._lastNumber = this.getLastItem(false);
    }

    result = this.getResultCalc()
  
    if (last == '%') {
      result /= 100;

      this._operation = [result]
    } else {
      // insere o novo dado no array
      this._operation = [result];

      if(last) this._operation.push(last);
    }  
    this.setLastNumberToDisplay();
  }

  // insere ou verifica se realiza a operação
  pushOperation(value) {
    // insere a segunda operaçao
    this._operation.push(value);
  
    // com dois algarismos e um operador realiza a soma com this.calc()
    if(this._operation.length > 3) {
      this.calc();
    }
  }

  // retorna o ultimo número ou ultima operação
  getLastItem(isOperation = true) {
    let lastItem;
  
    // for de tras para frente e adiciona o ultimo numero na variavel
    for(let i = this._operation.length -1; i>=0; i--) {

      // retorna a ultima operação
      if(this.isOperation(this._operation[i]) == isOperation) {
        lastItem = this._operation[i];
        break;
      } 
    }

    if(!lastItem) {
      lastItem = (isOperation) ? this._lastOperator : this._lastNumber;
    }

    return lastItem;
  }

  // verifica se o dado é numero e insere no display
  setLastNumberToDisplay() {
    // retorna o número quando false
    let lastNumber = this.getLastItem(false);

    if(!lastNumber) lastNumber = 0
    // insere no display o ultimo valor
    this.displayCalc = lastNumber;
  }

  // verifica as ações possíves
  addOperation(value) {
    // isNaN => verdadeiro se for qualquer outro tipo diferente de número, false se for numero 
    if(isNaN(this.getLastOperation())) {
      //verifica se o ulimo dado na operação é um operador
      if(this.isOperation(value)) {
        // seta o novo operador
        this.setLastOperation(value);
      } 
      else if(isNaN(value)) {
        
      }
      else {
        // insere um novo dado na operação
        this.pushOperation(value);
        this.setLastNumberToDisplay();
      }
    } 
    else {
      if(this.isOperation(value)) {
        this.pushOperation(value);
      } 
      else {
        let newValue = this.getLastOperation().toString() + value.toString();
        this.setLastOperation(newValue);
      }
        this.setLastNumberToDisplay();
    }
  }

  // trata os pontos
  addDot() {
    let lastOperation = this.getLastOperation();

    if(typeof lastOperation === 'string' && lastOperation.split('').indexOf('.') > -1) return

    if(this.isOperation(lastOperation) || !lastOperation) {
      this.pushOperation('0.');
    } else {
      this.setLastOperation(lastOperation.toString() + '.');
    }

    this.setLastNumberToDisplay();
  }

  // Verifica retorno das ações dos botões
  acaoBtn(value) {
    this.playAudio();

    switch (value) {
      case 'ac':
        this.clearAll();
        break;
      case 'ce':
        this.clearEntry();
        break;
      case 'porcento':
        this.addOperation('%');
        break;
      case 'divisao':
        this.addOperation('/');
        break;
      case 'multiplicacao':
        this.addOperation('*');
        break;
      case 'subtracao':
        this.addOperation('-');
        break;
      case 'soma':
        this.addOperation('+');
        break;
      case 'igual':
        this.calc();
        break;
      case 'ponto':
        this.addDot();
        break;
      case '0':
      case '1':
      case '2':
      case '3':
      case '4':
      case '5':
      case '6':
      case '7':
      case '8':
      case '9':
        this.addOperation(parseInt(value))
        break
      default:
        this.setError()
        break
      }
  }

  // erro
  setError() {
    this.displayCalc = "Error"
  }
}
