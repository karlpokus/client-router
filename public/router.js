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

var router = {
  hijackEvents: function() {
    $('body').on('click', 'a', function(e){ // anchors
      e.preventDefault();
      var path = $(this).attr('href');
      router.go(path, true);
    });
    $(window).on('popstate', function(e){ // popstate
      var path = window.location.pathname + window.location.search;
      router.go(path, false);
    });
  },
  URLparser: function(str) {
    var out = {};
  
    if (/\?/.test(str)) { // has ?
      var majorParts = str.split('?');
      out.path = majorParts[0];
      out.query = {};

      majorParts[1].split('&').forEach(function(str){
        var parts = str.split('='),
            k = parts[0],
            v = parts[1];
        out.query[k] = v;
      });

    } else {
      out.path = str;
    }
    return out;
  },
  routes: {},
  add: function(path, fn) {
    this.routes[path] = fn;
  },
  go: function(path, update) {
    if (update) {
      history.pushState({}, "", path);
    }
    var url = this.URLparser(path);
    
    if (this.routes[url.path]) {
      if (url.query) {
        this.routes[url.path](url.query);
      } else {
        this.routes[url.path]();
      }
    }    
  }
};

var app = {
  init: function() {
    router.hijackEvents();
    router.add('/', app.showHome);
    router.add('/item', app.showItem);
    router.add('/items', app.showItems);
    router.add('/about', app.showAbout);
    var path = window.location.pathname + window.location.search;
    router.go(path, false);
  },
  showHome: function() {
    $('.content').empty();
  },
  showItem: function(query) {
    $('.content').empty().hbs(tmpl.item, db.findById(query.id));
  },
  showItems: function() {
    $('.content').empty().hbs(tmpl.items, db.data);
  },
  showAbout: function() {
    $('.content').empty().text('This is an awesome place to buy epic stuff');
  }
};

app.init();
