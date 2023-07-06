import { fetchMovieList, fetchMovieAvailability } from "./api.js";

const loader = $('<div id="loader">Loading...</div>');

getMovieList();

const selecetedSeats = [];

async function getMovieList() {
  $("main").append(loader);
  const movies = await fetchMovieList();
  loader.remove();
  createMovieList(movies);
}

function createMovieList(movies) {
  movies.forEach((movie) => {
    const card = createMovieCard(movie);

    $(".movie-holder").append(card);
  });
}

function createMovieCard(movieDetails) {
  const { imgUrl, name } = movieDetails;

  const templateStr = `<a class="movie-link" href="/${name}">
<div class="movie" data-d=${name}>
<div class="movie-img-wrapper" style="background-image:url('${imgUrl}');background-size: cover;">
</div>
<h4>${name}</h4>
</div>
</a>`;

  const domEl = $(templateStr)[0];

  domEl.addEventListener("click", function (e) {
    e.preventDefault();
    // const el = document.querySelectorAll('#booker h3')

    getSeats(name);
  });
  return domEl;
}

async function getSeats(movieName) {
  $("#booker h3").removeClass("v-none");
  document.querySelector('#booker-grid-holder').innerHTML = ''
  $("#booker").append(loader);
  

  // unavaible seats
  const seats = await fetchMovieAvailability(movieName);
  loader.remove();
  createTicketsGrid(seats);
}

function createGridBox(unavaibleSeats, isRight) {
  const gridBox = $(`<div class="booking-grid"></div>`);

  for (let i = isRight ? 13 : 1; i <= (isRight ? 24 : 12); i++) {
    const isUnavailable = unavaibleSeats.includes(i);
    const gridItem = $(
      `<div id="booking-grid-${i}" class="${
        isUnavailable ? "unavailable-seat" : "available-seat"
      }">${i}</div>`
    )[0];

    gridItem.addEventListener("click", function (e) {
      if (!isUnavailable) {
        selectSeat(i, $(this));
      }
    });
    gridBox.append(gridItem);
  }

  return gridBox;
}

function createTicketsGrid(seats) {
  const lgrid = createGridBox(seats);
  const rgrid = createGridBox(seats, true);
  document.querySelector('#booker-grid-holder').innerHTML = ''
  $("#booker-grid-holder").append(lgrid);
  $("#booker-grid-holder").append(rgrid);
}

function selectSeat(seatNo, gridItem) {
  if (selecetedSeats.includes(seatNo)) {
    const index = selecetedSeats.indexOf(seatNo);
    selecetedSeats.splice(index, 1);
    gridItem.removeClass("selected-seat");
  } else {
    selecetedSeats.push(seatNo);
    gridItem.addClass("selected-seat");
  }

  if (selecetedSeats.length) {
    $("#book-ticket-btn").removeClass("v-none");
  } else {
    $("#book-ticket-btn").addClass("v-none");
  }
}

const bookSeatbtn = $("#book-ticket-btn")[0];
bookSeatbtn.addEventListener("click", function (e) {
  const confirmForm = createBookingForm(selecetedSeats);
  // el.innerHTML = ''
  $("#booker").html(confirmForm);
});

function createBookingForm(selecetedSeats) {
  const container = $(`
    <div id="confirm-purchase">
      <h3>
      Confirm your booking for seat numbers:${selecetedSeats.join(", ")}
      </h3>
      <form id="customer-detail-form">
        <div>
        <label for="email">Email</label>
        <input required type="email" id="email" name="email"/>
        </div>
        <div>
        <label for="phone">Phone</label>
        <input required type="tel" id="phone" name="phone"/>
        </div>
        <input type="submit"  value="Purchase"/>
      </form>
    </div>
  `);

  const form = container.find("#customer-detail-form")[0];

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const data = new FormData(form);

    let details = {
      selecetedSeats,
    };
    for (const [name, value] of data) {
      details[name] = value.trim();
    }

    const bookingDetails = createBookingDetails(details);
    $("#booker").html(bookingDetails);
  });
  return container;
}

function createBookingDetails(details) {
  const { email, phone, selecetedSeats } = details;
  const container = $(`
    <div id="Success">
      <h3>Booking details</h3>
      <div>
      Seats:${selecetedSeats.join(", ")}
      </div>
      <div>
      Phone number: ${phone}
      </div>
      <div>
      Email: ${email}
      </div>
    </div>
  `);
  return container;
}
