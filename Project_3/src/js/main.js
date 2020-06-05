import 'core-js';


document.addEventListener('DOMContentLoaded', () => {


	// --------Tabs --------------------

	const tabs = document.querySelectorAll('.tabheader__item'),
		tabsContent = document.querySelectorAll('.tabcontent'),
		parentTabs = document.querySelector('.tabheader__items');

	function hideTabContent() {
		tabsContent.forEach(item => {
			item.classList.add('hide');
			item.classList.remove('show', 'fade');
		})

		tabs.forEach(item => {
			item.classList.remove('tabheader__item_active');
		})
	}

	function showTabsContent(i = 0) {
		tabsContent[i].classList.add('show', 'fade');
		tabsContent[i].classList.remove('hide');
		tabs[i].classList.add('tabheader__item_active');
	}

	hideTabContent();
	showTabsContent();

	parentTabs.addEventListener('click', (e) => {

		const target = e.target;

		tabs.forEach((item, i) => {
			if (target == item && !target.classList.contains('tabheader__item_active')) {
				hideTabContent();
				showTabsContent(i);
			}
		})
	})

	//---------------------------------

	// ------------- Timer -----------

	const targetDate = new Date('2020,6,5');

	function createDiffDate(endtime) {

		const timerDate = Date.parse(endtime) - new Date();

		const leftDays = Math.floor(timerDate / (1000 * 60 * 60 * 24));
		const leftHours = Math.floor(timerDate / (1000 * 60 * 60) % 24);
		const leftMinutes = Math.floor((timerDate / 1000 / 60) % 60);
		const leftSeconds = Math.floor((timerDate / 1000) % 60);

		return {
			targetDate,
			leftDays,
			leftHours,
			leftMinutes,
			leftSeconds
		}
	}

	function addZero(num) {
		if (num >= 0 && num < 10) {
			num = `0${num}`;
			return num;
		} else {
			return num;
		}
	}

	function insertTimerBlock(selector, endtime) {

		const timerBlock = document.querySelector(selector),

			timerBlockDays = timerBlock.querySelector('#days'),
			timerBlockHours = timerBlock.querySelector('#hours'),
			timerBlockMinutes = timerBlock.querySelector('#minutes'),
			timerBlockSeconds = timerBlock.querySelector('#seconds'),
			timeInterval = setInterval(updateClock, 1000);

		updateClock();

		function updateClock() {
			const t = createDiffDate(endtime);

			timerBlockDays.innerHTML = addZero(t.leftDays);
			timerBlockHours.innerHTML = addZero(t.leftHours);
			timerBlockMinutes.innerHTML = addZero(t.leftMinutes);
			timerBlockSeconds.innerHTML = addZero(t.leftSeconds);

			if (t.targetDate <= 0) {
				clearInterval(timeInterval);
			}
		}

	}

	insertTimerBlock('.timer', targetDate)

	//--------------------------------------------------------------

	//------------------------ Modal window -----------------------

	const btnConnectMe = document.querySelectorAll('[data-modal]'),
		modalW = document.querySelector('.modal');

	function openModal() {
		modalW.classList.toggle('show');
		document.body.classList.add('overFix');
		clearInterval(banner);
	}

	function closeModal() {
		modalW.classList.toggle('show');
		document.body.classList.remove('overFix');
	}


	btnConnectMe.forEach((item) => {
		item.addEventListener('click', openModal)
	})

	modalW.addEventListener('click', (e) => {
		if (e.target.classList.contains('show') || e.target.classList.contains('modal__close')) {
			closeModal();
		}
	})

	document.addEventListener('keydown', (e) => {
		if (e.code === 'Escape') {
			closeModal();
		}
	})

	const banner = setTimeout( openModal, 100000);

	function showModalByScroll() {
		if (window.pageYOffset + document.documentElement.clientHeight >= document.documentElement.scrollHeight) {
			openModal();
			window.removeEventListener('scroll', showModalByScroll);
		}
	}

	window.addEventListener('scroll', showModalByScroll);

	//--------------------------------------------------------------

	//-----------------Card Item ----------------------------------

	class CardItem {
		constructor(caption, alt, subtitle, descr, price,parentSelector,...classes) {
			this.caption = caption;
			this.alt = alt;
			this.subtitle = subtitle;
			this.descr = descr;
			this.price = price;
			this.classes = classes;
			this.courseChange = 71;
			this.parent = document.querySelector(parentSelector)
		}

		changeToRub() {
			this.price = this.price * this.courseChange;
		}
	
		createCard() {
			this.changeToRub();
			const element = document.createElement('div');

			if (this.classes.length === 0) {
					this.classes = "menu__item";
					element.classList.add(this.classes);
			} else {
					this.classes.forEach(className => element.classList.add(className));
			}
			
			element.innerHTML = `
					<img src=${this.caption} alt=${this.alt}>
					<h3 class="menu__item-subtitle">${this.subtitle}</h3>
					<div class="menu__item-descr">${this.descr}</div>
					<div class="menu__item-divider"></div>
					<div class="menu__item-price">
							<div class="menu__item-cost">Цена:</div>
							<div class="menu__item-total"><span>${this.price}</span> руб/день</div>
					</div>
			`;
			this.parent.append(element);
	}
	}

	axios.get('http://localhost:3000/menu')
		.then(data => {
			data.data.forEach(({img, altimg, title, descr, price}) => {
				new CardItem(img, altimg, title, descr, price, '.menu .container').createCard();
			});
		});




//--------------------------------------------------

//-------------------------SERVER(FORMS) -----------------

const forms = document.querySelectorAll('form');
const message = {
		loading: 'img/form/spinner.svg',
		success: 'Спасибо! Скоро мы с вами свяжемся',
		failure: 'Что-то пошло не так...'
};

forms.forEach(item => {
	bindPostData(item);
});

const postData = async (url, data) => {
	const res = await fetch(url, {
		method: "POST",
		headers: {
			'Content-type': 'application/json'
		},
		body: data
	});
		return await res.json();
}



function bindPostData(form) {
	form.addEventListener('submit', (e) => {
		e.preventDefault();

		let statusMessage = document.createElement('img');
		statusMessage.src = message.loading;
		statusMessage.style.cssText = `
						display: block;
						margin: 0 auto;
				`;
		form.insertAdjacentElement('afterend', statusMessage);

		const formData = new FormData(form);

		const json = JSON.stringify(Object.fromEntries(formData.entries()))

		postData('http://localhost:3000/requests', json)
			.then(data => {
				console.log(data);
				showThanksModal(message.success);
				statusMessage.remove();
			})
			.catch(() => {
				showThanksModal(message.failure);
			}).finally(() => {
				form.reset();
			});
	});
}


function showThanksModal(message) {
	const prevModalDialog = document.querySelector('.modal__dialog')

	prevModalDialog.classList.add('hide');
	openModal();

	const thanksModal = document.createElement('div');
	thanksModal.classList.add('modal__dialog');
	thanksModal.innerHTML = `
		<div class="modal__content">
			<div class="modal__title">${message}</div>
			<div class="modal__close" data-close>&times;</div>
		</div>
	`;

	document.querySelector('.modal').append(thanksModal);
	setTimeout(()=> {
		thanksModal.remove();
		prevModalDialog.classList.add('show');
		prevModalDialog.classList.remove('hide');
		closeModal();
	},4000)
}	

//--------------------- SLIDER ------------------------------


const slideImg = document.querySelectorAll('.offer__slide'),
			slideImgCurrent = document.querySelector('#current'),
			slideImgTotal = document.querySelector('#total');

hideSlideImg()


function slideNumbers(arr) {
	arr.forEach((item,i) => {
		if(i<10) {
			slideImgCurrent.innerHTML = `0${i}`;
		} else {
			slideImgCurrent.innerHTML = `${i}`;
		}
		if(arr.length<10) {
			slideImgTotal.innerHTML = `0${arr.length}`;
		} else {
			slideImgTotal.innerHTML = `${arr.length}`;
		}
	})
}

slideNumbers(slideImg);
showSlideImg();

function showSlideImg() {
	slideImg.forEach((item,i) => {
		item[i].classList.add('show');
		item[i].classList.remove('hide');
	})
}
function hideSlideImg() {
	slideImg.forEach((item,i) => {
		item[i].classList.add('hide');
		item[i].classList.remove('show');
	})
}

// slideImg.forEach((item,i) => {
// 	item.classList.add('hide');
// })








})

