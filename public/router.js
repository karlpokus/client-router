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
  bindRouteHandlers: function(arr) {
    arr.forEach(function(o){
      for (var k in o) {
        if (typeof o[k] === 'function') {
          o[k] = o[k].bind(o);
        }
      }
    });
  },
  URLparser: function(str) {
    var out = {};
  
    if (/\?/.test(str)) {
      var majorParts = str.split('?');
      out.path = majorParts[0];
      out.query = majorParts[1]
        .split('&')
        .reduce(function(base, str){
          var minorParts = str.split('='),
            k = minorParts[0],
            v = minorParts[1];
          base[k] = v;
          return base;
      }, {});

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

var view = {
  el: $('.content'),
  home: function() {
    this.el.empty();
  },
  item: function(query) {
    this.el.empty().hbs(tmpl.item, db.findById(query.id));
  },
  items: function() {
    this.el.empty().hbs(tmpl.items, db.data);
  },
  about: function() {
    this.el.empty().text('This is an awesome place to buy epic stuff');
  }
};

var app = {
  init: function() {
    router.bindRouteHandlers([view]);
    router.hijackEvents();
    router.add('/', view.home);
    router.add('/item', view.item);
    router.add('/items', view.items);
    router.add('/about', view.about);
    var path = window.location.pathname + window.location.search;
    router.go(path, false);
  }  
};

app.init();
