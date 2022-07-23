export default class LocalStorage {
  constructor() {
    this.trello = document.querySelector('.js-trello');
  }

  saveCards() {
    const array = [];
    const boards = this.trello.querySelectorAll('.js-board');
    for (const board of boards) {
      let cards = board.querySelectorAll('.js-card');
      const cardsArray = [];
      if (cards.length > 0) {
        cards = Array.from(cards);
        cards.forEach((card) => {
          cardsArray.push(card.querySelector('.js-card-text').textContent);
        });
      }
      array.push(cardsArray);
    }
    localStorage.trelloUserContent = JSON.stringify(array);
  }

  extractCards() {
    if (!localStorage.trelloUserContent) return;
    const array = JSON.parse(localStorage.trelloUserContent);
    const boadrs = this.trello.querySelectorAll('.js-board');
    array.forEach((board, index) => {
      const boardCards = boadrs[index].querySelector('.js-cards');
      if (board.length > 0) {
        board.forEach((textCard) => {
          // Создание и вставка карточка
          const card = document.createElement('div');
          card.classList.add('trello__card', 'js-card');
          card.innerHTML = '<span class="trello__card-text js-card-text"></span>';
          card.querySelector('.js-card-text').textContent = textCard;
          boardCards.append(card);
          // Вставка кнопки-крестик на карточку (удалить карточку)
          const deleteButton = document.createElement('div');
          deleteButton.classList.add('trello__delete-card', 'js-delete-card');
          deleteButton.innerHTML = '<span> + </span>';
          card.append(deleteButton);
        });
      }
    });
  }
}
