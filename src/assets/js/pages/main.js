import {apiToken, chatId} from "./telegram_token.min.js";
$(function () {
      //2. Получить элемент, к которому необходимо добавить маску
      //$("#field2").mask("+38(099)999-99-99");
      $("#phone").inputmask({ "mask": "+38 (999) 999-99-99" });

      function setDisabled(state, button) {
        if (state) {
          button.disabled = true;
        } else { button.disabled = false; };
      }


      function findErrors(form, name, phone, email) {
        let err = false;
        if (name === '') {
          $(form).find('#name').siblings('.error').show();
          err = true;
        } else {
          $(form).find('#name').siblings('.error').hide();
        };
        if (phone === '') {
          $(form).find('#phone').siblings('.error').show();
          err = true;
        } else {
          $(form).find('#phone').siblings('.error').hide();
        };
        if (email === '') {
          $(form).find('#email').siblings('.error').show();
          err = true;
        } else {
          $(form).find('#email').siblings('.error').hide();
        };
        return err;
      }

      /* map init */
      function initMap() {
        const map = L.map('map').setView([49.428577, 26.9785098], 17);
        L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {
          attribution: ''
        }).addTo(map);
        const orangeIcon = L.icon({
          iconUrl: './../assets/images/pin.svg',
          iconSize: [24, 24],
          iconAnchor: [24, 24],
        });
        L.marker([49.428577, 26.9785098], { icon: orangeIcon, title: 'центр сучасної освіти АЛФА' }).addTo(map)
      }

      /*call functions */

      new WOW().init();
      let lazyLoadInstance = new LazyLoad();
      /* events defenition */

      $('#map_link').on('click', function () {
        $('#map').html('');
        initMap();
      })

      /*$('a[data-scroll]').on('click', function (e) {
        e.preventDefault();

        if (this.hasAttribute('name-diraction')) { this.removeAttribute('name-diraction') };
        const href = $(this).attr('href');
        $('html, body').animate({ scrollTop: $(href).offset().top }, 600);
        let nextHref = document.getElementById(href.slice(1)).nextElementSibling;
        if (nextHref != null && href != '#footer')
          $(this).attr('href', '#' + nextHref.id)
        else if (href == '#contact-us') {
          $(this).attr('href', '#footer');
        } else {
          $(this).attr('href', '#main-part');
          this.setAttribute('name-diraction', 'up');
        }
      });*/

      /*$('#hamburger').on('click', function () {
        $(this).toggleClass('is-active');
        $('#mainMenu').slideToggle();
        $('#mainMenu').toggleClass('open');
      });*/

      $('#contact').on('submit', function (e) {
        e.preventDefault();
        setDisabled(true, e);
        let name = $(this).find('#name').val(),
          phone = $(this).find('#phone').val(),
          email = $(this).find('#email').val();
        let errors = findErrors(this, name, phone, email);
        if (errors) {
          setDisabled(false, e);
          return false
        }
        const msg = `
                <b>Contact us</b>
                <b>Name: </b> ${name}
                <b>Email: </b> ${email}
                <b>Phone: </b> ${phone}`;
        //
        //credentiale in separate file
        //console.log(apiToken , chatId);
        console.log(apiToken , chatId);
        fetch(`https://api.telegram.org/bot${apiToken}/sendMessage`, {
          method: 'post',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            chat_id: chatId,
            text: msg,
            parse_mode: 'HTML'
          })
        })
          .then(response => {
            $(".mainFormContent").css('visibility', 'hidden');
            if (response.ok) {
              $(".successMessage").show();

              $(".errorMessage").hide();
            } else {
              $(".errorMessage").show();

              $(".successMessage").hide();
            }
            const element = document.querySelector('.resultMessage');
            element.classList.add('wow');
            new WOW().init();
          })
          .finally(() => {
            setDisabled(false, e);
            this.reset();
          });
      });
      $('#reiterate').on('click', function (e) {
        e.preventDefault();
        $(".resultMessage").css('visibility', 'hidden');
        $(".mainFormContent").css('visibility', 'visible');
      });
    });


    if (Swiper != "undefined") {
      const swiper = new Swiper('.swiper', {
        loop: true,
        effect: "cards",
        grabCursor: true,
        autoplay: {
          delay: 5000,
        },
        navigation: {
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
        }
      });
    };