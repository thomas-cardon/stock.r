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
