var express = require('express');
var mysql = require('./dbcon.js');
var bodyParser = require('body-parser');
var app = express();
var handlebars = require('express-handlebars').create({ defaultLayout: 'main' });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', 7644);

app.get('/reset-table', function (req, res, next) {
  var context = {};
  mysql.pool.query("DROP TABLE IF EXISTS workouts", function (err) { //replace your connection pool with the your variable containing the connection pool
    var createString = "CREATE TABLE workouts(" +
      "id INT PRIMARY KEY AUTO_INCREMENT," +
      "name VARCHAR(255) NOT NULL," +
      "reps INT," +
      "weight INT," +
      "date DATE," +
      "lbs BOOLEAN)";
    mysql.pool.query(createString, function (err) {
      context.results = "Table reset";
      res.render('index', context);
    })
  });
});

app.get('/', function (req, res) {
  res.render('index');
});

app.get('/showDB', function (req, res, next) {
  mysql.pool.query('SELECT * FROM workouts', function (err, rows, fields) {
    if (err) {
      next(err);
      return;
    }
    res.type('application/json');
    res.send(rows);
  });

});

app.post('/insert', function (req, res, next) {
  mysql.pool.query("INSERT INTO workouts (`name`, `reps`,`weight`,`lbs`,`date`) VALUES (?,?,?,?,?)",
    [req.body.name, req.body.reps, req.body.weight, req.body.unit, req.body.date], function (err, result) {
      if (err) {
        next(err);
        return;
      }
      mysql.pool.query('SELECT * FROM workouts', function (err, rows, fields) {
        if (err) {
          next(err);
          return;
        }
        res.type('application/json');
        res.send(rows);
      });

    });
});

app.post('/update', function (req, res, next) {
  mysql.pool.query("UPDATE workouts SET name=?, date=?, reps=?, weight=?, lbs=? WHERE id = ?",
    [req.body.name, req.body.date, req.body.reps, req.body.weight, req.body.unit, req.body.id], function (err, result) {
      if (err) {
        next(err);
        return;
      }
      mysql.pool.query('SELECT * FROM workouts', function (err, rows, fields) {
        if (err) {
          next(err);
          return;
        }
        res.type('application/json');
        res.send(rows);
      });

    });
});


app.post('/delete', function (req, res, next) {
  mysql.pool.query("DELETE FROM workouts WHERE id = ?", [req.body.id], function (err, result) {
    if (err) {
      next(err);
      return;
    }
    mysql.pool.query('SELECT * FROM workouts', function (err, rows, fields) {
      if (err) {
        next(err);
        return;
      }
      res.type('application/json');
      res.send(rows);
    });

  });
});



app.use(function (req, res) {
  res.status(404);
  res.render('404');
});

app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(500);
  res.render('500');
});


app.listen(app.get('port'), function () {
  console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});
