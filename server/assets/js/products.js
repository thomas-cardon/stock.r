let Product = {};

bootbox.setDefaults({ locale: 'fr' }); // Setting bootbox so the modals buttons are in french.
Product.view = product => {
  let m = '<div class="row">';

  m += ``;
  m += `<div class="col-md-4"><img src="${product.image}" class="img-thumbnail"></div>`;
  m += '</div>'; // Closing .row

  bootbox.dialog({
    title: '<span data-feather="package"></span>' + product.name,
    message: m
  });
};

Product.edit = id => {

};

/*
* Handling products array
*/
socket.on('products', products => {
  products.forEach((product, i) => {
    let el = $(`<div class="col-md-4" id="${product.id}"></div>`);
    el.append($('<div class="card mb-4 box-shadow"></div>').append($(`<img class="card-img-top" style="height: 225px; width: 100%; display: block;" src="${product.image}"><div class="card-body"></div>`)));

    /*
    * Title
    */
    el.find('.card-body').append(`<h5 class="card-title">${product.name}</h5>`);

    /*
    * Description, button group and grey text
    */
    el.find('.card-body').append(`<p class="card-text">${product.desc}</p>`).append(`<div class="d-flex justify-content-between align-items-center"><div class="btn-group"></div><small class="text-muted"></small></div>`);

    /*
    * Buttons
    */
    el.find('.btn-group').append('<button type="button" class="btn btn-sm btn-outline-secondary" id="view">View</button><button type="button" class="btn btn-sm btn-outline-secondary" id="edit">Edit</button>');

    /*
    * Adding events to buttons
    */
    el.find('#view').click(() => Product.view(product));
    el.find('#edit').click(() => Product.edit(product));

    /*
    * Setting .text-muted to value product.location
    */

    el.find('.text-muted').val(product.location);

    /*
    * Adding card footer to card
    */
    el.children().append(`<div class="card-footer"><i data-feather="package" class="text-left"></i><small class="text-muted text-sm-left"> Quantité: <strong>${product.qty}</strong></small><small class="text-muted text-right"> Emplacement ${product.location}</small></div>`);

    /*
    * Adding element to #products
    */

    el.appendTo('#products');

    if (i === products.length - 1) feather.replace(); // Reloading feather once products are shown
  });
});

/*
* Asking for products
*/
socket.emit('products');
