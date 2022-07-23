import LocalStorage from './LocalStorage';

export default class Trello {
  constructor() {
    this.localStorage = new LocalStorage();
    this.trello = document.querySelector('.js-trello');
    this.draggedCard = null; // Сюда записывается перетаскиваемая карточка;
    this.clonedCard = null; // Сюда записывается клонированная карточка;
    this.offsetCardClickX = null; // Сюда записывается позиция курсора по оси X в
    // момент клика по перетаскиваемой карточке;
    this.offsetCardClickY = null; // Сюда записывается позиция курсора по оси Y в
    // момент клика по перетаскиваемой карточке;
    this.isFirstClick = true; // Сюда записываем
    this.addEventsToBoards = this.addEventsToBoards.bind(this);
  }

  init() {
    this.localStorage.extractCards();
    this.addEventsToBoards();
  }

  addEventsToBoards() {
    this.trello.addEventListener('click', (e) => {
      e.preventDefault();
      if (e.target.classList.contains('js-add-textarea')) {
        // Кнопка "Добавить карточку" (показать поле ввода текста)
        this.removeActiveTextarea();
        this.hideAddCardPanel();
        this.showAddCardPanel(e.target);
        const board = e.target.closest('.js-board');
        const cardsContainer = board.querySelector('.js-cards');
        const textarea = document.createElement('textarea');
        textarea.classList.add('trello__textarea', 'js-textarea');
        cardsContainer.insertAdjacentElement('afterEnd', textarea);
        textarea.focus();
        return;
      }

      if (e.target.classList.contains('js-add-card-button')) {
        // Кнопка "Добавить карточку" (создает карточку на доске)
        const textCard = e.target.closest('.js-board').querySelector('.js-textarea');
        if (textCard.value === '') return;
        // Создаем и вставляем карточку
        const cardsBlock = e.target.closest('.js-board').querySelector('.js-cards');
        const card = document.createElement('div');
        card.classList.add('trello__card', 'js-card');
        card.innerHTML = '<span class="trello__card-text js-card-text"></span>';
        card.querySelector('.js-card-text').textContent = textCard.value;
        cardsBlock.append(card);
        // Вставляем крестик на карточку (удалить карточку)
        const deleteButton = document.createElement('div');
        deleteButton.classList.add('trello__delete-card', 'js-delete-card');
        deleteButton.innerHTML = '<span> + </span>';
        card.append(deleteButton);
        this.localStorage.saveCards();
      }

      if (e.target.classList.contains('js-delete-card')) {
        // Крестик на карточке (удалить карточку)
        const card = e.target.closest('.js-card');
        card.remove();
        this.localStorage.saveCards();
      }

      if (e.target.classList.contains('js-textarea')) return; // При клике на textarea ничего не делаем
      this.removeActiveTextarea(); // Скрываем активное поле textarea при клике вне него
      this.hideAddCardPanel();
    });

    const cardBlocks = document.querySelectorAll('.js-cards');
    for (const cardBlock of cardBlocks) {
      cardBlock.addEventListener('mousedown', (e) => {
        e.preventDefault();
        if (!e.target.classList.contains('js-card')) return;
        document.body.classList.add('_grabbing');
        this.draggedCard = e.target;
        this.clonedCard = e.target.cloneNode(true);
        this.clonedCard.classList.add('_drag');
        this.clonedCard.style.width = `${this.draggedCard.offsetWidth}px`;
        document.body.append(this.clonedCard);
        this.draggedCard.classList.add('_ghost');
        // Определяем позицию курсора внутри карточки в момент клика
        const coordsClickedCard = this.draggedCard.getBoundingClientRect();
        this.offsetCardClickX = e.pageX - coordsClickedCard.left;
        this.offsetCardClickY = e.pageY - coordsClickedCard.top;
        this.positionsDraggedCard(e);
      });
    }

    this.trello.addEventListener('mousemove', (e) => {
      e.preventDefault();
      if (!this.draggedCard) return;
      this.positionsDraggedCard(e);
      if (e.target.classList.contains('js-card')) {
        const coordsMovedCard = e.target.getBoundingClientRect();
        const coordsAboutCenter = e.pageY - (coordsMovedCard.bottom - coordsMovedCard.height / 2);
        if (coordsAboutCenter < 0) {
          e.target.insertAdjacentElement('beforeBegin', this.draggedCard);
        }
        if (coordsAboutCenter > 0) {
          e.target.insertAdjacentElement('afterEnd', this.draggedCard);
        }
        return;
      }
      if (e.target.classList.contains('js-add-textarea')) {
        const cardsBlock = e.target.closest('.js-board').querySelector('.js-cards');
        cardsBlock.append(this.draggedCard);
      }
    });

    this.trello.addEventListener('mouseleave', (e) => {
      if (!this.draggedCard) return;
      if (this.draggedCard) this.draggedCard.classList.remove('_ghost');
      this.dropGrabbingCard();
    });

    this.trello.addEventListener('mouseup', (e) => {
      if (!this.draggedCard) return;
      if (this.draggedCard) {
        this.draggedCard.classList.remove('_ghost');
        this.localStorage.saveCards();
      }
      this.dropGrabbingCard();
    });
  }

  removeActiveTextarea() {
    const activeTextarea = document.querySelector('.js-textarea');
    if (activeTextarea) activeTextarea.remove();
  }

  showAddCardPanel(buttonShowTextarea) {
    buttonShowTextarea.classList.add('_hide');
    const board = buttonShowTextarea.closest('.js-board');
    const addCardButton = document.createElement('button');
    addCardButton.type = 'button';
    addCardButton.classList.add('trello__add-card-button', 'js-add-card-button');
    addCardButton.textContent = 'Добавить карточку';
    board.insertAdjacentElement('beforeEnd', addCardButton);
  }

  hideAddCardPanel() {
    const buttonShowTextarea = document.querySelector('.js-add-textarea._hide');
    const addCardButton = document.querySelector('.js-add-card-button');
    if (buttonShowTextarea) buttonShowTextarea.classList.remove('_hide');
    if (addCardButton) addCardButton.remove();
  }

  positionsDraggedCard(evt) {
    this.clonedCard.style.left = `${evt.pageX - this.offsetCardClickX}px`;
    this.clonedCard.style.top = `${evt.pageY - this.offsetCardClickY}px`;
  }

  dropGrabbingCard() {
    document.body.classList.remove('_grabbing');
    document.body.removeChild(this.clonedCard);
    this.draggedCard = null;
    this.clonedCard = null;
  }
}
