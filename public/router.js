(function($) {
  $.fn.hbs = function(tmpl, data) {
    var src = (typeof tmpl === 'string')? tmpl: tmpl.join(""),
        compiler = Handlebars.compile(src);

    this.append(compiler(data));
    return this;
  };
}(jQuery));

var db = {
  data: [
    {id: 1, title: 'bag', body: 'a brown bag'},
    {id: 2, title: 'bottle', body: 'full of whisky'},
    {id: 3, title: 'socks', body: 'from npm?'}
  ],
  findById: function(id) {
    return db.data.filter(function(o){
      return o.id == id;
    })[0];
  }
};

function router(path, update) {
  if (update) {
    history.pushState({}, "", path);
  }
  painter(path);
}

var tmpl = {
  item: [
    '<h3>{{title}}</h3>',
    '<p>{{body}}</p>'
  ],
  items: [
    '{{#each this}}',
      '<a href="/item?id={{id}}">{{title}}</a>',
      '<p>{{body}}</p>',
    '{{/each}}'
  ]
};

function painter(path) {
  var $el = $('.content');
  var map = {
    '/items': function() {
      $el.empty().hbs(tmpl.items, db.data);
    },
    '/item': function(id) {
      $el.empty().hbs(tmpl.item, db.findById(id));
    },
    '/': function() {
      $el.empty();
    },
    '/about': function() {
      $el.empty().text('This is an awesome place to buy epic stuff');
    }
  };
  // has querystring
  if (/\?/.test(path)) {
    var parts = path.split('?'),
        pathPart = parts[0],
        id = parts[1].split('=')[1];
    map[pathPart](id);

  } else if (map[path]) {
    map[path]();
  }
}

function init() {
  // links
  $('body').on('click', 'a', function(e){
    e.preventDefault();
    var path = $(this).attr('href');
    router(path, true);
  });
  // popstate
  $(window).on('popstate', function(e){
    var path = window.location.pathname;
    router(path, false);
  });
  // initial
  var path = window.location.pathname; // include search?
  router(path, false);
}

init();
