var express = require('express');
var router = express.Router();
var product = require('../Models/Product');
var cookieParser = require('cookie-parser');
var pool = require('../postgresPool');
var multer = require('multer');
var crypto = require ("crypto")
var passwordHash = require('password-hash');
var path = require("path"),
fs = require('fs');
var passport = require('passport');
var moment = require('moment');

var storage = multer.diskStorage({
    destination: './public/uploads',
    filename: function (req, file, cb) {
        crypto.pseudoRandomBytes(16, function (err, raw) {
            var passwordHash = require('password-hash');            if (err) return cb(err)

            var filename = file.originalname.replace(/\.[^/.]+$/, "")
            cb(null, filename + path.extname(file.originalname))
        })
    }
})

var upload = multer({ storage: storage })

/* GET home page. */
router.get('/auth/facebook', passport.authenticate('facebook'));
router.get('/auth/facebook/callback',
    passport.authenticate('facebook', {
        successRedirect : '/',
        failureRedirect: '/login'
    }),
    function(req, res) {

        res.redirect('/');
    });

router.get('/', function(req, res, next) {
    var session = req.session;
    var is_fbuser = false;
    if (req.user != undefined)
    {
        var fbUsername = req.session.passport.user.displayName;
        var id = req.session.passport.user.id;
        console.log(req.session.passport.user);
        session.tenkh = fbUsername;
        session.makh = id;
        is_fbuser = true;
    }
  pool.connect(function (err,client,done) {
      done(err);
      if(err){
          console.log(err);
          return err;
      }
      var q= "Select * from sanpham where mahxs = $1";
      var params =[1];
        client.query(q,params,function (err,r1) {
            if(err){
                console.log(err);
                return err;
            }else{
               params = [2];
               client.query(q,params,function (err,r2) {
                   if(err){
                       console.log(err);
                       return err;
                   }else{
                       q = 'Select * from sanpham where mahxs not in (1,2)';
                       client.query(q,function (err,r3) {
                           if(err){
                               console.log(err);
                               return err;
                           }else{
                               if(req.cookies.amountOfProduct){
                                   res.render('index',{products1: r1,products2:r2,products3:r3,amountOfProduct:req.cookies.amountOfProduct,session:session});
                               }
                               else{
                                   res.render('index',{products1: r1,products2:r2,products3:r3,amountOfProduct:'0',session:session});
                               }
                           }
                       })
                   }
               })

            }
        });
    });

});
router.get('/sanpham',function (req,res) {
    res.render('product',{amountOfProduct:req.cookies.amountOfProduct});
});;
router.delete('/removeProduct', function(req, res, next) {
    var productID = req.body.productID;
    var amountOfProduct = parseInt(req.cookies.amountOfProduct);
    var cartCookie = JSON.parse(req.cookies.cart).products;
    for(var i = 0 ;i< cartCookie.length;++i) {
        if(cartCookie[i].masp == productID){
            amountOfProduct = amountOfProduct-cartCookie[i].soluongmua;
            var tempObj = cartCookie[i];
            cartCookie[i] = cartCookie[0];
            cartCookie[0] = tempObj;
            cartCookie.shift();
            break;
        }
    }
    res.cookie('amountOfProduct',amountOfProduct,{maxAge:1000*60*60*24*30,httpOnly:false});
    res.cookie('cart',JSON.stringify({products:cartCookie}),{maxAge:1000*60*60*24*30,httpOnly:true});
    res.send(amountOfProduct+'');
});
router.post('/addToCart', function(req, res, next) {
    var productID = req.body.productID;
    console.log(productID);
    pool.connect(function (err,client,done) {
        done(err);
        if(err){
            console.log(err);
            return err;
        }else{
            var q = 'Select * From sanpham where masp = $1';
            var params = [productID];
            client.query(q,params,function (err,result) {
                if(err){
                    console.log(err);
                    return err;
                }
                if(req.cookies.cart){

                    var cartCookie = JSON.parse(req.cookies.cart).products;
                    var amountOfProduct = parseInt(req.cookies.amountOfProduct);
                    var added = 0;
                    for(var i = 0;i<cartCookie.length;i++){
                        if(cartCookie[i].masp === productID){
                            cartCookie[i].soluongmua ++;
                            console.log('++');
                            added=1;
                            break;
                        }
                    }
                    if(added==0){
                            result.rows[0].soluongmua = 1;
                            cartCookie.push(result.rows[0]);
                            console.log('push');
                    }
                    amountOfProduct++;
                    res.cookie('amountOfProduct',amountOfProduct,{maxAge:1000*60*60*24*30,httpOnly:false});
                    res.cookie('cart',JSON.stringify({products:cartCookie}),{maxAge:1000*60*60*24*30,httpOnly:true});
                    res.send(amountOfProduct + '');
                } else {
                    console.log('new');
                    result.rows[0].soluongmua = 1;
                    res.cookie('cart',JSON.stringify({products: [result.rows[0]]}),{maxAge:1000*60*60*24*30,httpOnly:true});
                    res.cookie('amountOfProduct',1,{maxAge:1000*60*60*24*30,httpOnly:false});
                    res.send('1');
                }
            })

        }
    })

});
router.get('/login',function (req,res) {
    var session = req.session;
    var products = JSON.parse(req.cookies.cart).products;
    res.render('log-in',{products:products,amountOfProduct:req.cookies.amountOfProduct ,session:session});
});
router.post('/',function (req,res,next) {

    var email = req.body.username;
    var pass = req.body.password;

    var session  = req.session;
    pool.connect(function (err,client,done) {
        if (err) {
            return console.error('error fetching client from pool', err);
        }
        client.query("select * from khachhang", function (err, result) {
            //call `done(err)` to release the client back to the pool (or destroy it if there is an error)
            // console.log(result.rows);
            done(err);

            if (err) {
                return console.error('error running query', err);
            }
            var check = -1;
            console.log(email+"    +     "+pass);
            for (var i = 0; i < result.rows.length; i++) {

                if (email == result.rows[i].taikhoan &&  passwordHash.verify(pass, result.rows[i].password )) {
                    check = 1;
                    session.makh = result.rows[i].makh;
                    session.tenkh = result.rows[i].tenkh;
                    session.diachi = result.rows[i].diachi;
                    session.sdt = result.rows[i].sdt;
                    session.taikhoan = result.rows[i].taikhoan;
                }
            }
            res.redirect('/');
        });
    });
})

router.get('/signup',function (req,res) {
    var session = req.session;
    var products = JSON.parse(req.cookies.cart).products;
    res.render('signup',{products:products,amountOfProduct:req.cookies.amountOfProduct,session:session});
})
router.post('/signup',function (req,res) {
    var user = req.body.username;
    var pass = req.body.password;
    var hashedPassword = passwordHash.generate(pass);

    var phone = req.body.phone;
    var name = req.body.name;
    var address = req.body.address;
    var products = JSON.parse(req.cookies.cart).products;
    var session = req.session;
    pool.connect(function (err,client,done) {
        if (err) {
            return console.error('error fetching client from pool', err);
        }
        var q1 = "select * from khachhang"
        client.query(q1, function (err, result) {
            //call `done(err)` to release the client back to the pool (or destroy it if there is an error)
            // console.log(result.rows);
            done(err);

            if (err) {
                return console.error('error running query', err);
            }
            var check = -1;
            for (var i = 0; i < result.rows.length; i++) {

                if (user == result.rows[i].taikhoan && hashedPassword == result.rows[i].password) {
                   check = 1;
                }
            }
            if(check ==1)
            {
                res.render('signup',{error:'Tài Khoản Đã Tồn Tại',session:session,products:products,amountOfProduct:req.cookies.amountOfProduct});
            }
            else{
                pool.connect(function (err,client,done) {
                    if (err) {
                        return console.error('error fetching client from pool', err);
                    }
                    var q2 = "insert into khachhang(tenkh,taikhoan,password,tongchi,sdt,diachi) values('@tentk','@taikhoan','@password','@tongchi','@sdt','@diachi')";
                    q2 = q2.replace('@tentk',name);
                    q2 = q2.replace('@taikhoan',user);
                    q2 = q2.replace('@password',hashedPassword);
                    q2 = q2.replace('@tongchi',0);
                    q2 = q2.replace('@sdt',phone);
                    q2 = q2.replace('@diachi',address);


                    client.query(q2, function (err, result) {
                        //call `done(err)` to release the client back to the pool (or destroy it if there is an error)
                        // console.log(result.rows);
                        done(err);

                        if (err) {
                            return console.error('error running query', err);
                        }
                        res.render('log-in',{title:'Đăng Kí Thành Công',session:session,products:products,amountOfProduct:req.cookies.amountOfProduct});

                    });
                });
            }
        });
    });

})

router.get('/showCart',function (req,res) {
    var session = req.session;
    var products = JSON.parse(req.cookies.cart).products;
    res.render('./partials/quick_cart',{products:products,amountOfProduct:req.cookies.amountOfProduct,session:session});
})

router.get('/logout',function (req,res) {
    req.session.destroy();
    res.redirect('/');
})

router.get('/addToHeart/:id1/:id2',function (req,res) {
    var makh = req.params.id1;
    var masp = req.params.id2;
    var session = req.session;
    pool.connect(function(err, client, done) {
        if(err) {
            return console.error('error fetching client from pool', err);
        }
        var q = "select * from yeuthich"
        client.query(q, function(err, result) {
            //call `done(err)` to release the client back to the pool (or destroy it if there is an error)
            done(err);

            if(err) {
                return console.error('error running query', err);
            }
            var kq = result.rows;
            var check = -1;
            for(var i = 0 ; i< kq.length; i++)
            {
                if(makh == kq[i].makh && masp == kq[i].masp)
                {
                    check =1;
                }
            }
            if(check == -1)
            {
                pool.connect(function(err, client, done) {
                    if(err) {
                        return console.error('error fetching client from pool', err);
                    }
                    var que = "insert into yeuthich(masp,makh) values('@masp','@makh')";
                    que = que.replace('@masp',masp);
                    que = que.replace('@makh',makh);

                    client.query(que, function(err, result) {
                        //call `done(err)` to release the client back to the pool (or destroy it if there is an error)
                        done(err);

                        if(err) {
                            return console.error('error running query', err);
                        }

                        res.redirect('/');



                        //output: 1
                    });
                });
            }
            else {
                res.redirect('/');
            }


            //output: 1
        });
    });

})

router.get('/shellout',function (req,res) {
    var session = req.session;
    var products = JSON.parse(req.cookies.cart).products;
    res.render('shellout',{products:products,amountOfProduct:req.cookies.amountOfProduct,session:session});
})

router.get('/manage-account',function (req,res) {
    var session = req.session;
    var products = JSON.parse(req.cookies.cart).products;
    if(session.makh) {
        pool.connect(function (err, client, done) {
            if (err) {
                return console.error('error fetching client from pool', err);
            }
            var q = "SELECT * from khachhang where makh = '@makh'";
            q = q.replace('@makh', session.makh);
            console.log(q);
            client.query(q, function (err, result) {
                //call `done(err)` to release the client back to the pool (or destroy it if there is an error)
                done(err);

                if (err) {
                    return console.error('error running query', err);
                }

                res.render('manage-account', {
                    products: products,
                    amountOfProduct: req.cookies.amountOfProduct,
                    session: session,
                    khach: result.rows[0]
                });
            });
        });
    }
    else {
        res.redirect('/');
    }
})

router.post('/member/update-info',function (req,res) {
    var session = req.session;
    var products = JSON.parse(req.cookies.cart).products;

    var name = req.body.name;
    var phone = req.body.phone;
    var email = req.body.email;
    var address = req.body.address;
    var session = req.session;

    console.log(session);
    pool.connect(function(err, client, done) {
        if(err) {
            return console.error('error fetching client from pool', err);
        }
        var q = "update khachhang set tenkh = '@tenkh', sdt= '@sdt',email = '@email', diachi = '@diachi' where makh ='@makh'";
        q = q.replace('@tenkh',name);
        q = q.replace('@sdt',phone);
        q = q.replace('@email',email);
        q = q.replace('@diachi',address);
        q = q.replace('@makh',session.makh);
        console.log(q);
        client.query(q, function(err, result) {
            //call `done(err)` to release the client back to the pool (or destroy it if there is an error)
            done(err);

            if(err) {
                return console.error('error running query', err);
            }
            console.log(result.rows);
            res.redirect('/manage-account')
        });
    });
})

router.get('/changePassword',function (req,res) {
    var session = req.session;
    var products = JSON.parse(req.cookies.cart).products;
    if(session.makh) {
        pool.connect(function (err, client, done) {
            if (err) {
                return console.error('error fetching client from pool', err);
            }
            var q = "SELECT * from khachhang where makh = '@makh'";
            q = q.replace('@makh', session.makh);
            console.log(q);
            client.query(q, function (err, result) {
                //call `done(err)` to release the client back to the pool (or destroy it if there is an error)
                done(err);

                if (err) {
                    return console.error('error running query', err);
                }

                res.render('changePassword', {error:'',
                    products: products,
                    amountOfProduct: req.cookies.amountOfProduct,
                    session: session,
                    khach: result.rows[0]
                });
            });
        });
    }
    else {
        res.redirect('/');
    }
})

router.post('/changing',function (req,res) {
    var oldpass = req.body.old_pass;
    var newpass = req.body.new_pass;
    var session = req.session;
    var products = JSON.parse(req.cookies.cart).products;

       pool.connect(function (err, client, done) {
           if (err) {
               return console.error('error fetching client from pool', err);
           }
           var q1 = "select * from khachhang where makh ='@makh'";
           q1 = q1.replace('@makh', session.makh);

           client.query(q1, function (err, result) {
               //call `done(err)` to release the client back to the pool (or destroy it if there is an error)
               done(err);
               if (err) {
                   return console.error('error running query', err);
               }
               if (oldpass != result.rows[0].password) {
                   res.render('changePassword', {
                       error: 'Mật Khẩu Cũ Không Đúng!',
                       products: products,
                       amountOfProduct: req.cookies.amountOfProduct,
                       session: session
                   });
               }
               else {
                   pool.connect(function (err, client, done) {
                       if (err) {
                           return console.error('error fetching client from pool', err);
                       }
                       var q2 = "update khachhang set password = '@newpass'";
                       q2 = q2.replace('@newpass', newpass);

                       client.query(q2, function (err, result) {
                           //call `done(err)` to release the client back to the pool (or destroy it if there is an error)
                           done(err);

                           if (err) {
                               return console.error('error running query', err);
                           }

                           res.render('changePassword',{alert:'Đổi Mật Khẩu Thành Công',products:products,amountOfProduct:req.cookies.amountOfProduct,session:session});
                       });
                   });

               }

           });
       });


});

router.get('/news',function (req,res) {
    var session = req.session;
    var products = JSON.parse(req.cookies.cart).products;

    pool.connect(function (err, client, done) {
        if (err) {
            return console.error('error fetching client from pool', err);
        }
        var q = "SELECT * from tinkhuyenmai";
        q = q.replace('@makh', session.makh);
        console.log(q);
        client.query(q, function (err, result) {
            //call `done(err)` to release the client back to the pool (or destroy it if there is an error)
            done(err);

            if (err) {
                return console.error('error running query', err);
            }

            res.render('news', {error:'',
                products: products,
                amountOfProduct: req.cookies.amountOfProduct,
                session: session,
                news: result.rows
            });
        });
    });

})

router.get('/news/detail/:id',function (req,res) {
    var session = req.session;
    var products = JSON.parse(req.cookies.cart).products;
    var id = req.params.id;
    pool.connect(function (err, client, done) {
        if (err) {
            return console.error('error fetching client from pool', err);
        }
        var q = "SELECT * from tinkhuyenmai where matinkm = '@ma'";
        q = q.replace('@ma', id);
        console.log(q);
        client.query(q, function (err, result) {
            //call `done(err)` to release the client back to the pool (or destroy it if there is an error)
            done(err);

            if (err) {
                return console.error('error running query', err);
            }

            res.render('news-detail', {error:'',
                products: products,
                amountOfProduct: req.cookies.amountOfProduct,
                session: session,
                detail: result.rows[0]
            });
        });
    });
})

router.get('/viewheart',function (req,res) {
    var session = req.session;
    var products = JSON.parse(req.cookies.cart).products;

    pool.connect(function (err, client, done) {
        if (err) {
            return console.error('error fetching client from pool', err);
        }
        var q = "SELECT * from yeuthich y join sanpham s on y.masp = s.masp where y.makh = '@makh' ";
        q = q.replace('@makh', session.makh);
        console.log(q);
        client.query(q, function (err, result) {
            //call `done(err)` to release the client back to the pool (or destroy it if there is an error)
            done(err);

            if (err) {
                return console.error('error running query', err);
            }

            res.render('viewHeart', {error:'',
                products: products,
                amountOfProduct: req.cookies.amountOfProduct,
                session: session,
                heart: result.rows
            });
        });
    });

})

router.get('/remove-heart/:id',function (req,res) {
    var session = req.session;
    var id = req.params.id;

    var products = JSON.parse(req.cookies.cart).products;

    pool.connect(function (err, client, done) {
        if (err) {
            return console.error('error fetching client from pool', err);
        }
        var q = "delete from yeuthich y where y.makh = '@makh' and y.masp = '@masp' ";
        q = q.replace('@makh', session.makh);
        q = q.replace('@masp',id);
        console.log(q);
        client.query(q, function (err, result) {
            //call `done(err)` to release the client back to the pool (or destroy it if there is an error)
            done(err);

            if (err) {
                return console.error('error running query', err);
            }

            res.redirect('/viewheart');
        });
    });
})

router.post('/order',function (req,res) {
    var session = req.session;
    var name = req.body.name;
    var email = req.body.email;
    var phone = req.body.phone;
    var address = req.body.address;
    var ghichu = req.body.comment;
    var products = JSON.parse(req.cookies.cart).products;
    var d = new Date();
    var tongtien = 0;
    for(var i = 0 ; i< products.length;i++)
    {
        tongtien += parseInt(products[i].gia);
    }

    pool.connect(function (err, client, done) {
        if (err) {
            return console.error('error fetching client from pool', err);
        }
        var q1 = "insert into donhang(ngaythang,somon,tongtien,ghichu,makh,tinhtrang) values('@ngaythang','@somon','@tongtien','@ghichu','@makh','@tinhtrang') returning madh";
        q1= q1.replace('@makh', session.makh);
        var currentdate = moment().format("MM-DD-YYYY");

        q1= q1.replace('@ngaythang', currentdate);
        q1= q1.replace('@somon', products.length);
        q1= q1.replace('@tongtien', tongtien);
        q1= q1.replace('@ghichu', ghichu);
        q1= q1.replace('@tinhtrang', 0);

        client.query(q1, function (err, result) {
            //call `done(err)` to release the client back to the pool (or destroy it if there is an error)
            done(err);

            if (err) {
                return console.error('error running query', err);
            }

            var key = result.rows[0].madh;
            console.log("key : "+ result.rows[0].madh);



            for(var i = 0 ; i < products.length;i++)
            {
                var tmp = products[i];

                pool.connect(function (err, client, done) {
                    if (err) {
                        return console.error('error fetching client from pool', err);
                    }
                    var q2 = "insert into ctdonhang(madh,masp,soluong,tinhtrang) values('@madh','@masp','@soluong','@tinhtrang')";
                    q2= q2.replace('@madh', key);
                    q2= q2.replace('@masp', tmp.masp);
                    q2= q2.replace('@soluong', tmp.soluongmua);
                    q2= q2.replace('@tinhtrang', 0);


                    var q3 = "update sanpham set daban = daban + '@soluong' where masp = '@masp' ";
                    q3 = q3.replace('@soluong',tmp.soluongmua);
                    q3 = q3.replace('@masp',tmp.masp);

                    client.query(q2, function (err, result) {
                        //call `done(err)` to release the client back to the pool (or destroy it if there is an error)
                        done(err);
                        if (err) {
                            return console.error('error running query', err);
                        }
                    });

                    client.query(q3, function (err, result) {
                        //call `done(err)` to release the client back to the pool (or destroy it if there is an error)
                        done(err);
                        if (err) {
                            return console.error('error running query', err);
                        }
                    });

                });
            }
        });


        res.redirect('/');
    });


})

/* -----------------------------------THIS IS ADMIN ROUTE ONLY-----------------------------------------------*/

router.get('/admin', function(req, res, next) {

    var sess = req.session;
    if(sess.admin === undefined)
    {
        res.render("admin/ad_login.ejs");
    }
    else{
        var search = req.query.q;
        res.redirect("admin/dashboard")

    }

});

router.post('/admin', function(req, res, next) {

    var admin = req.body.username;
    var password = req.body.password;

    pool.connect(function (err,client,done) {
        if (err) {
            return console.error('error fetching client from pool', err);
        }
        client.query("select taikhoan,password from admin", function (err, result) {
            //call `done(err)` to release the client back to the pool (or destroy it if there is an error)
            // console.log(result.rows);
            done(err);

            if (err) {
                return console.error('error running query', err);
            }
            var check = -1;

            for (var i = 0; i < result.rows.length; i++) {

                if (admin == result.rows[i].taikhoan && passwordHash.verify(password, result.rows[i].password) ) {
                    check = 1;

                    var sess = req.session;
                    sess.admin = admin;
                    sess.save();

                    break;

                }
            }
            if(check == 1){
                res.redirect('/admin/dashboard');
            }
            else {
                res.send("not found");
            }

        });
    });
});

router.get('/admin/logout',function (req,res,nect) {

    var sess = req.session;
    sess.admin = undefined;
    res.redirect("/admin");
});

router.get('/admin/sp', function(req, res, next) {

    var search = req.query.q;
    var currentpage = 0;
    var page = req.query.page;

    var tableloaisp = [];
    var tablesp = [];
    var query = "";

    var sess = req.session;
    if(sess.admin == undefined)
    {
        res.redirect("/admin");
    }
    if(search == undefined)
    {
        query = "select sanpham.masp as masp,tensp,gia,tonkho,images,mahxs," +
            "maincam,gps,bluetooth,bonho,sim,gpu,dophangiai,subcam,trongluong," +
            "thenho,hdh,cpu,thoigiancho,kichthuoc,ram,thoigianthoai,kichthuoc,cambien,wifi" +
            " from sanpham left join ctsanpham on sanpham.masp = ctsanpham.masp " +
            " order by sanpham.masp limit 10 offset @offset;"

    }
    else
    {
        query = "select sanpham.masp as masp,tensp,gia,tonkho,images,mahxs," +
            "maincam,gps,bluetooth,bonho,sim,gpu,dophangiai,subcam,trongluong," +
            "thenho,hdh,cpu,thoigiancho,kichthuoc,ram,thoigianthoai,kichthuoc,cambien,wifi" +
            " from sanpham left join ctsanpham on sanpham.masp = ctsanpham.masp " +
            "where LOWER(tensp) like LOWER('%@tensp%') order by sanpham.masp limit 10 offset @offset ;"
        query = query.replace("@tensp",search);
    }

    if(page != undefined)
    {
        currentpage = parseInt(page);
        query = query.replace("@offset",currentpage*10);
    }
    else
    {
        query = query.replace("@offset","0");
    }

    console.log("myquery is :" + query);

    pool.connect(function(err, client, done) {
        if(err) {
            return console.error('error fetching client from pool', err);
        }


        console.log(query);
        var queryPreferences = client.query(query, function (err, result) {
            //call `done(err)` to release the client back to the pool (or destroy it if there is an error)
            /*  done(err);*/



            if (err) {
                return console.error('error running query', err);
            }


        });

        var getloaisp = function () {

            var queryFoods = client.query("select mahxs,tenhxs from hangsanxuat;", function (err, resultstatus) {
                //call `done(err)` to release the client back to the pool (or destroy it if there is an error)
                /*   done(err);*/

                if (err) {
                    return console.error('error running query', err);
                }

            });

            queryFoods.on('row', function (row) {

                tableloaisp.push(row);

            });
            queryFoods.on('end', function () {

                done();
                res.render("admin/ad_sanpham.ejs",{tablesp:tablesp,mysearch:search,currentpage:currentpage
                    ,num:tablesp.length,limit:10,tableloaisp:tableloaisp});
            });
        }
        queryPreferences.on('row',function (my) {
            tablesp.push(my);

        });
        queryPreferences.on('end', getloaisp);

    });



});

router.post('/admin/sp/add', upload.any(),function(req, res, next) {
    var masp = req.body.masp;
    var tensp = req.body.tensp;
    var gia = req.body.gia;
    var tonkho = req.body.sl;

    var sim = req.body.sim;
    var gps = req.body.gps;
    var wifi = req.body.wifi;
    var bluetooth = req.body.bluetooth;
    var bonho = req.body.bonho;
    var thenho = req.body.thenho;
    var hdh = req.body.hdh;
    var cpu = req.body.cpu;
    var gpu = req.body.gpu;
    var ram = req.body.ram;
    var cambien = req.body.cambien;
    var trongluong = req.body.trongluong;
    var thoigiancho = req.body.thoigiancho;
    var thoigianthoai = req.body.thoigianthoai;
    var kichthuoc = req.body.kichthuoc;
    var dophangiai = req.body.dophangiai;
    var maincam = req.body.maincam;
    var subcam = req.body.subcam;
    var loaisp = req.body.loaisp;
    var arrayimg = [];
    arrayimg = req.body.img;


    var lastid = 0;
    var count = 2;

    pool.connect(function (err, client, done) {
        if (err) {
            return console.error('error fetching client from pool', err);
        }

        function endHandler () {
            count--; // decrement count by 1
            if (count == 0) {
                // two queries have ended, lets close the connection.
                done();
                res.redirect('/admin/sp');
            }
        }
        var q ="insert into sanpham(tensp,gia,tonkho, images,mahxs) " +
            "values('" + tensp + "','" + gia + "','" + tonkho + "','{"+arrayimg+"}','"+loaisp+"') returning masp;";
        console.log(q);
        var queryPreferences = client.query(q, function (err, result) {
            //call `done(err)` to release the client back to the pool (or destroy it if there is an error)


            if (err) {
                return console.error('error running query', err);
            }

            lastid = result.rows[0].masp;
            console.log(lastid);

        });

        var insertctsanpham = function () {

            var queryFoods = client.query("insert into ctsanpham(maincam,gps,wifi,bluetooth,bonho,masp,sim," +
                "gpu,dophangiai,subcam,trongluong,thenho,hdh,cpu,thoigiancho,kichthuoc,ram,thoigianthoai,cambien) " +
                "values('" + maincam + "','" + gps + "','" + wifi + "','" + bluetooth + "','" + bonho + "','" + lastid + "'," +
                "'" + sim + "','" + gpu + "','" + dophangiai + "','" + subcam + "','" + trongluong + "','" + thenho + "','" + hdh + "','" + cpu + "'" +
                ",'" + thoigiancho + "','" + kichthuoc + "','" + ram + "','" + thoigianthoai + "','" + cambien + "'); ");


            queryFoods.on('end', function () {

                done();
                console.log(masp, tensp, gia, tonkho, sim, gps, wifi +
                    bluetooth, bonho, thenho, hdh, cpu, gpu, ram, cambien, trongluong +
                    thoigiancho, thoigianthoai, kichthuoc, dophangiai, maincam, subcam);
                res.redirect('/admin/sp');


            });
        }

        queryPreferences.on('end', insertctsanpham);



    })
});

router.post('/admin/sp/sua', upload.any(), function(req, res, next) {
    var masp = req.body.masp;
    var tensp = req.body.tensp;
    var gia = req.body.gia;
    var tonkho = req.body.soluong;

    var sim = req.body.sim;
    var gps = req.body.gps;
    var wifi = req.body.wifi;
    var bluetooth = req.body.bluetooth;
    var bonho = req.body.bonho;
    var thenho = req.body.thenho;
    var hdh = req.body.hdh;
    var cpu = req.body.cpu;
    var gpu = req.body.gpu;
    var ram = req.body.ram;
    var cambien = req.body.cambien;
    var trongluong = req.body.trongluong;
    var thoigiancho = req.body.thoigiancho;
    var thoigianthoai = req.body.thoigianthoai;
    var kichthuoc = req.body.kichthuoc;
    var dophangiai = req.body.dophangiai;
    var maincam = req.body.maincam;
    var subcam = req.body.subcam;
    var arrayimg = [];
    arrayimg = req.body.updateimg;

    var mymasp = 0;



    pool.connect(function (err, client, done) {
        if (err) {
            return console.error('error fetching client from pool', err);
        }


        var q1 = "update sanpham set tensp = '@tensp', gia = '@gia', tonkho = '@tonkho', images ='{@images}' where masp = @masp returning masp";
        q1 = q1.replace("@tensp",tensp);
        q1 = q1.replace("@gia",gia);
        q1 = q1.replace("@tonkho",tonkho);
        q1 = q1.replace("@masp",masp);
        q1 = q1.replace("@images",arrayimg);

        console.log(q1);
        var q2 = "update ctsanpham set maincam = '@maincam' ,gps ='@gps' ,wifi ='@wifi' ,bluetooth ='@bluetooth',bonho='@bonho'" +
            ",sim='@sim',gpu='@gpu',dophangiai='@dophangiai',subcam='@subcam',trongluong='@trongluong'," +
            "thenho='@thenho',hdh='@hdh',cpu='@cpu',thoigiancho='@thoigiancho',kichthuoc='@kichthuoc',ram='@ram',thoigianthoai='@thoigianthoai',cambien ='@cambien'" +
            "where masp = @masp";
        q2 = q2.replace("@maincam",maincam);
        q2 = q2.replace("@gps",gps);
        q2 = q2.replace("@wifi",wifi);
        q2 = q2.replace("@bluetooth",bluetooth);
        q2 = q2.replace("@bonho",bonho);
        q2 = q2.replace("@sim",sim);
        q2 = q2.replace("@gpu",gpu);
        q2 = q2.replace("@dophangiai",dophangiai);
        q2 = q2.replace("@subcam",subcam);
        q2 = q2.replace("@trongluong",trongluong);
        q2 = q2.replace("@thenho",thenho);
        q2 = q2.replace("@hdh",hdh);
        q2 = q2.replace("@cpu",cpu);
        q2 = q2.replace("@thoigiancho",thoigiancho);
        q2 = q2.replace("@kichthuoc",kichthuoc);
        q2 = q2.replace("@ram",ram);
        q2 = q2.replace("@thoigianthoai",thoigianthoai);
        q2 = q2.replace("@cambien",cambien);
        q2 = q2.replace("@masp",masp);

        console.log(q2);


        var queryPreferences = client.query(q1, function (err, result) {
            //call `done(err)` to release the client back to the pool (or destroy it if there is an error)
            /* done(err);*/

            if (err) {
                return console.error('error running query', err);
            }

            mymasp = result.rows[0].masp;
            console.log(mymasp);

        });

        var updatectsanpham = function () {

            var queryFoods = client.query(q2);


            queryFoods.on('end', function () {
                done();
                console.log(masp, tensp, gia, tonkho, sim, gps, wifi +
                    bluetooth, bonho, thenho, hdh, cpu, gpu, ram, cambien, trongluong +
                    thoigiancho, thoigianthoai, kichthuoc, dophangiai, maincam, subcam);
                res.redirect('/admin/sp');
            });
        }

        queryPreferences.on('end', updatectsanpham);



    })
});

router.post('/admin/sp/del', function(req, res, next) {
    var masp = req.body.delid;

    pool.connect(function (err, client, done) {
        if (err) {
            return console.error('error fetching client from pool', err);
        }

        var q1 = "Delete from sanpham where masp =" + masp;
        var q2 = "delete from ctsanpham where masp=" + masp;

        var queryPreferences = client.query(q1, function (err, result) {
            //call `done(err)` to release the client back to the pool (or destroy it if there is an error)
            done(err);

            if (err) {
                return console.error('error running query', err);
            }

        });

        var delctsanpham = function () {

            var queryFoods = client.query(q2);

            queryFoods.on('end', function () {
                client.end();
            });
        }

        queryPreferences.on('end', delctsanpham);
    });

    res.redirect('/admin/sp')

});

/* Admin route khuyen mai . */
router.get('/admin/km', function(req, res, next) {

    var search = req.query.q;
    var currentpage = 0;
    var page = req.query.page;

    var query = "";
    var sess = req.session;
    if(sess.admin == undefined)
    {
        res.redirect("/admin");
    }
    if(search == undefined)
    {
        query = "select makm,mota,to_char(batdau,'DD/MM/YYYY') as batdau," +
            "to_char(ketthuc,'DD/MM/YYYY') as ketthuc ,soluong,dadung from khuyenmai " +
            "order by makm limit 10 offset @offset ;";
    }
    else
    {
        query = "select makm,mota,to_char(batdau,'DD/MM/YYYY') as batdau," +
            "to_char(ketthuc,'DD/MM/YYYY') as ketthuc ,soluong,dadung from khuyenmai " +
            "where LOWER(mota) like LOWER('%@search%') order by makm limit 10 offset @offset;";

        query = query.replace("@search",search);
    }

    if(page != undefined)
    {
        currentpage = parseInt(page);
        query = query.replace("@offset",page);
    }
    else
    {
        query = query.replace("@offset",0);
    }

    pool.connect(function(err, client, done) {
        if(err) {
            return console.error('error fetching client from pool', err);
        }

        //use the client for executing the query
        client.query(query , function(err, result) {
            //call `done(err)` to release the client back to the pool (or destroy it if there is an error)
            done(err);

            if(err) {
                return console.error('error running query', err);
            }

            console.log(result.rows);
            res.render("admin/ad_khuyenmai.ejs",{khuyenmais:result,mysearch:search,currentpage:currentpage
                ,num:result.rows.length,limit:10})

        });
    });


});

router.post('/admin/km/add', function(req, res, next) {

    var mota = req.body.mota;
    var batdau = req.body.batdau;
    var ketthuc = req.body.ketthuc;
    var soluong = req.body.soluong;

    console.log(mota,batdau,ketthuc,soluong);
    pool.connect(function(err, client, done) {
        if(err) {
            return console.error('error fetching client from pool', err);
        }

        var q ="insert into khuyenmai(mota,batdau,ketthuc,soluong,dadung) " +
            "values ('@mota','@batdau','@ketthuc',@soluong,0);";
        q = q.replace('@mota',mota);
        q = q.replace("@batdau",batdau);
        q = q.replace("@ketthuc",ketthuc);
        q = q.replace("@soluong",soluong);

        console.log(q);
        //use the client for executing the query
        client.query(q, function(err, result) {
            //call `done(err)` to release the client back to the pool (or destroy it if there is an error)
            done(err);

            if(err) {
                return console.error('error running query', err);
            }

            res.redirect("/admin/km");

        });
    });


});

router.post('/admin/km/update', function(req, res, next) {

    var mota = req.body.mota;
    var batdau = req.body.batdau;
    var ketthuc = req.body.ketthuc;
    var soluong = req.body.soluong;
    var makm = req.body.makm;

    console.log(mota,batdau,ketthuc,soluong);
    pool.connect(function(err, client, done) {
        if(err) {
            return console.error('error fetching client from pool', err);
        }

        var q ="update khuyenmai set mota ='@mota', batdau='@batdau',ketthuc='@ketthuc', soluong = @soluong where makm = '@makm'";
        q = q.replace('@mota',mota);
        q = q.replace("@batdau",batdau);
        q = q.replace("@ketthuc",ketthuc);
        q = q.replace("@soluong",soluong);
        q = q.replace("@makm",makm);

        console.log(q);
        //use the client for executing the query
        client.query(q, function(err, result) {
            //call `done(err)` to release the client back to the pool (or destroy it if there is an error)
            done(err);

            if(err) {
                return console.error('error running query', err);
            }

            res.redirect("/admin/km");

        });
    });


});

router.post('/admin/km/del', function(req, res, next) {

    var makm = req.body.delid;

    console.log(makm);
    pool.connect(function(err, client, done) {
        if(err) {
            return console.error('error fetching client from pool', err);
        }

        var q ="delete from khuyenmai where makm ="+makm;
        console.log(q);
        //use the client for executing the query
        client.query(q, function(err, result) {
            //call `done(err)` to release the client back to the pool (or destroy it if there is an error)
            done(err);

            if(err) {
                return console.error('error running query', err);
            }

            res.redirect("/admin/km");

        });
    });


});

/*Admin route khach hang*/
router.get('/admin/kh', function(req, res, next) {

    var khachhangs = [];
    var tablestatus = [];

    var search = req.query.q;
    var currentpage = 0;
    var page = req.query.page;

    var query = "";
    var sess = req.session;
    if(sess.admin == undefined)
    {
        res.redirect("/admin");
    }

    if(search != undefined)
    {
        query =  "select makh,tenkh,sdt,taikhoan,to_char(ngaythamgia,'DD/MM/YYYY') as ngaythamgia,tenstatus as status,tongchi,khoa " +
            "from khachhang left join ctstatus  on khachhang.mastatus = ctstatus.mastatus" +
            " where LOWER(tenkh) like LOWER('%@search%') or LOWER(taikhoan) like LOWER('%@search%') order by makh limit 10 offset @offset;"
        query = query.replace("@search",search);
        query = query.replace("@search",search);
    }
    else{
        query =  "select makh,tenkh,sdt,taikhoan,to_char(ngaythamgia,'DD/MM/YYYY') as ngaythamgia,tenstatus as status,tongchi,khoa " +
            "from khachhang left join ctstatus  on khachhang.mastatus = ctstatus.mastatus" +
            " order by makh limit 10 offset @offset;"
    }

    if(page != undefined){
        currentpage = parseInt(page);
        query = query.replace("@offset",currentpage);
    }
    else
    {
        currentpage = 0;
        query = query.replace("@offset",currentpage);
    }

    pool.connect(function(err, client, done) {
        if(err) {
            return console.error('error fetching client from pool', err);
        }


        console.log(query);
        var queryPreferences = client.query(query, function (err, result) {
            //call `done(err)` to release the client back to the pool (or destroy it if there is an error)
            /*  done(err);*/



            if (err) {
                return console.error('error running query', err);
            }


        });

        var getstatus = function () {

            var queryFoods = client.query("select mastatus, tenstatus from ctstatus;", function (err, resultstatus) {
                //call `done(err)` to release the client back to the pool (or destroy it if there is an error)
                /*   done(err);*/

                if (err) {
                    return console.error('error running query', err);
                }

            });

            queryFoods.on('row', function (row) {

                tablestatus.push(row);

            });
            queryFoods.on('end', function () {

                console.log(khachhangs);
                console.log(tablestatus);
                done();
                res.render("admin/ad_khachhang.ejs",{tablestatus:tablestatus, khachhangs:khachhangs,mysearch:search,currentpage:currentpage
                    ,num:khachhangs.length,limit:10});
            });
        }
        queryPreferences.on('row',function (my) {
            khachhangs.push(my);
            console.log(my);
        });
        queryPreferences.on('end', getstatus);

    });



});

router.post('/admin/kh/add', function(req, res, next) {

    var tenkh = req.body.tenkh;
    var taikhoan = req.body.taikhoan;
    var sdt = req.body.sdt;
    var ngaythamgia = req.body.ngaythamgia;
    var mastatus =  req.body.status;

    var password = '123456';
    var hashedPassword = passwordHash.generate(password);

    console.log("log is: " + tenkh,taikhoan,sdt,ngaythamgia,mastatus,mastatus);
    pool.connect(function(err, client, done) {
        if(err) {
            return console.error('error fetching client from pool', err);
        }

        var q ="insert into khachhang(tenkh,taikhoan,sdt,ngaythamgia,mastatus,tongchi,password)" +
            "values ('@tenkh','@taikhoan','@sdt','@ngaythamgia',@mastatus,0,'@password'); ";
        q = q.replace('@tenkh',tenkh);
        q = q.replace("@taikhoan",taikhoan);
        q = q.replace("@sdt",sdt);
        q = q.replace("@ngaythamgia",ngaythamgia);
        q = q.replace("@mastatus",mastatus);
        q = q.replace("@password",hashedPassword);

        console.log(q);
        //use the client for executing the query
        client.query(q, function(err, result) {
            //call `done(err)` to release the client back to the pool (or destroy it if there is an error)
            done(err);

            if(err) {
                return console.error('error running query', err);
            }

            res.redirect("/admin/kh");

        });
    });


});

router.post('/admin/kh/update', function(req, res, next) {

    var makh = req.body.makh;
    var tenkh = req.body.tenkh;
    var taikhoan = req.body.taikhoan;
    var sdt = req.body.sdt;
    var ngaythamgia = req.body.ngaythamgia;
    var mastatus = req.body.status;
    console.log(tenkh,taikhoan,sdt,ngaythamgia,mastatus);
    pool.connect(function(err, client, done) {
        if(err) {
            return console.error('error fetching client from pool', err);
        }

        var q ="update khachhang set tenkh ='@tenkh', taikhoan = '@taikhoan', sdt='@sdt', " +
            "ngaythamgia = '@ngaythamgia', mastatus= '@mastatus' where makh = @makh;";
        q = q.replace('@tenkh',tenkh);
        q = q.replace("@taikhoan",taikhoan);
        q = q.replace("@sdt",sdt);
        q = q.replace("@ngaythamgia",ngaythamgia);
        q = q.replace("@mastatus",mastatus);
        q = q.replace("@makh",makh);
        console.log(q);
        //use the client for executing the query
        client.query(q, function(err, result) {
            //call `done(err)` to release the client back to the pool (or destroy it if there is an error)
            done(err);

            if(err) {
                return console.error('error running query', err);
            }

            res.redirect("/admin/kh");

        });
    });


});

router.post('/admin/kh/del', function(req, res, next) {

    var makh = req.body.delid;


    pool.connect(function(err, client, done) {
        if(err) {
            return console.error('error fetching client from pool', err);
        }

        var q ="delete from khachhang where makh = @makh";
        q = q.replace("@makh",makh);
        console.log(q);
        //use the client for executing the query
        client.query(q, function(err, result) {
            //call `done(err)` to release the client back to the pool (or destroy it if there is an error)
            done(err);

            if(err) {
                return console.error('error running query', err);
            }

            res.redirect("/admin/kh");

        });
    });


});

router.post('/admin/kh/lock', function(req, res, next) {

    var makh = req.body.lockid;


    pool.connect(function(err, client, done) {
        if(err) {
            return console.error('error fetching client from pool', err);
        }


        var q ="update khachhang set khoa = ~(khoa) where makh = '@makh' ";
        q = q.replace("@makh",makh);
        console.log(q);
        //use the client for executing the query
        client.query(q, function(err, result) {
            //call `done(err)` to release the client back to the pool (or destroy it if there is an error)
            done(err);

            if(err) {
                return console.error('error running query', err);
            }

            res.redirect("/admin/kh");

        });
    });


});

/*route for setting*/
router.get('/admin/st', function(req, res, next) {

    var search = req.query.q;
    var sess = req.session;
    if(sess.admin == undefined)
    {
        res.redirect("/admin");
    }
    pool.connect(function(err, client, done) {
        if(err) {
            return console.error('error fetching client from pool', err);
        }

        var q ="select machinhanh,hotline,diachi,mailcskh,tenchinhanh from setting; ";

        console.log(q);
        //use the client for executing the query
        client.query(q, function(err, result) {
            //call `done(err)` to release the client back to the pool (or destroy it if there is an error)
            done(err);

            if(err) {
                return console.error('error running query', err);
            }

            console.log(result.rows);
            res.render("admin/ad_setting.ejs",{setting:result,mysearch:search});

        });
    });

});

router.post('/admin/st/update', function(req, res, next) {
    var tiente = req.body.tiente;
    var mail = req.body.mail;
    var hotline = req.body.hotline;
    var diachi = req.body.diachi;
    var machinhanh = req.body.machinhanh;
    var tenchinhanh = req.body.tenchinhanh;
    var hotlinenew = req.body.newhotline;
    var mailnew = req.body.newmailcskh;
    var final_hotline  = [];
    var final_mailcskh = [];
    hotline.forEach(function (a) {
        if(a != "")
            final_hotline.push('"'+a+'"');
    });
    if(hotlinenew != undefined) {
        hotlinenew.forEach(function (a) {
            if(a != "")
                final_hotline.push('"' + a + '"');
        });
    }
    mail.forEach(function (a) {
        if(a != "")
            final_mailcskh.push('"'+a+'"');
    });
    if(mailnew != undefined) {
        mailnew.forEach(function (a) {
            if(a != "")
                final_mailcskh.push('"' + a + '"');
        });
    }
    console.log(tiente,mail,hotline,diachi,machinhanh,hotlinenew,mailnew);
    var q ="update setting set tiente ='@tiente', mailcskh='{@mailcskh}', hotline ='{@hotline}', tenchinhanh ='@tenchinhanh' " +
        "where machinhanh = @machinhanh";

    q= q.replace("@machinhanh",machinhanh);
    q= q.replace("@tiente",tiente);
    q= q.replace("@mailcskh",final_mailcskh);
    q= q.replace("@hotline",final_hotline);
    q= q.replace("@tenchinhanh",tenchinhanh);
    console.log(q);
    //use the client for executing the query
    pool.connect(function(err, client, done) {
        if(err) {
            return console.error('error fetching client from pool', err);
        }


        console.log(q);
        //use the client for executing the query
        client.query(q, function(err, result) {
            //call `done(err)` to release the client back to the pool (or destroy it if there is an error)
            done(err);

            if(err) {
                return console.error('error running query', err);
            }

            console.log(result.rows);
            res.redirect("/admin/st");

        });
    });
});

router.get('/admin/upload',function (req,res,next) {
    res.render('admin/upload_demo.ejs');

});

router.post('/admin/uploadimg', upload.any(), function (req, res, next) {
    // req.file is the `avatar` file
    // req.body will hold the text fields, if there were any

    console.log(req.body.files);
    res.redirect('/admin/upload')

});


/*route for admin dashboard*/
router.get('/admin/dashboard', function(req, res, next) {
    var sess = req.session;
    if(sess.admin == undefined)
    {
        res.redirect("/admin");
    }
    var search = req.query.q;

    var topdonhang = [];
    var tongdoanhthu = 0;
    var doanhthuthang = [];
    var arrTopsanpham = [];
    pool.connect(function(err, client, done) {
        if(err) {
            return console.error('error fetching client from pool', err);
        }

        var query = "select madh,to_char(ngaythang,'DD/MM/YYYY') as ngaythang,somon,tongtien from donhang ORDER BY madh DESC LIMIT 5"
        console.log(query);
        var queryPreferences = client.query(query, function (err, result) {
            //call `done(err)` to release the client back to the pool (or destroy it if there is an error)
            /*  done(err);*/

            if (err) {
                return console.error('error running query', err);
            }


        });

        var sumdoanhthu = function () {

            var q2 = "select sum(tongtien) as doanhthu from donhang " +
                "where EXTRACT(MONTH FROM ngaythang) = '@currentmonth';";
            var currentmonth = new Date().getMonth() + 1;
            q2 = q2.replace('@currentmonth',currentmonth);
            console.log(q2);
            var queryFoods = client.query(q2, function (err, resultstatus) {
                //call `done(err)` to release the client back to the pool (or destroy it if there is an error)
                /*   done(err);*/


                if (err) {
                    return console.error('error running query', err);
                }

            });

            queryFoods.on('row', function (row) {

                tongdoanhthu = row.doanhthu;

            });
            queryFoods.on('end',topsanpham)
        }

        var doanhthuBymonth = function () {

            var q4 = "select to_char(ngaythang,'Mon') as thang, " +
                "extract(year from ngaythang) as yyyy, " +
                "sum(tongtien) as doanhthu " +
                "from donhang" +
                " group by 1,2";


            console.log(q4);
            var queryFoods = client.query(q4, function (err, resultstatus) {
                //call `done(err)` to release the client back to the pool (or destroy it if there is an error)
                /*   done(err);*/


                if (err) {
                    return console.error('error running query', err);
                }

            });

            queryFoods.on('row', function (row) {

                doanhthuthang.push(row);

            });
            queryFoods.on('end',sumdoanhthu)
        }

        var topsanpham = function () {

            var q3 = "select masp,tensp,daban from sanpham order by daban DESC limit 5";
            var currentmonth = new Date().getMonth() + 1;
            q3 = q3.replace('@currentmonth',currentmonth);
            console.log(q3);
            var query = client.query(q3, function (err, resultstatus) {
                //call `done(err)` to release the client back to the pool (or destroy it if there is an error)
                /*   done(err);*/


                if (err) {
                    return console.error('error running query', err);
                }

            });

            query.on('row', function (row) {

                arrTopsanpham.push(row);

            });
            query.on('end', function () {
                done();
                console.log(doanhthuthang);
                res.render("admin/ad_dashboard.ejs",{mysearch:search,topdonhang:topdonhang, tongdoanhthu:tongdoanhthu,current: currentmonth,
                    topsanpham:arrTopsanpham,doanhthuthang:doanhthuthang});
            });

        }



        queryPreferences.on('row',function (my) {
            topdonhang.push(my);
            console.log(my);
        });
        queryPreferences.on('end',doanhthuBymonth );

    });


});


/*route for admin management*/

router.get('/admin/ad',function (req,res,next) {

    var search = req.query.q;
    var page = req.query.page;
    var currentpage = 0;

    var sess = req.session;
    if(sess.admin == undefined)
    {
        res.redirect("/admin");
    }

    pool.connect(function(err, client, done) {
        if(err) {
            return console.error('error fetching client from pool', err);
        }

        var q = "";
        if(search != undefined) {
            q = "select id,taikhoan,password from admin" +
                " where LOWER(taikhoan) like LOWER('%@search%') limit 10 offset @offset;";
            q= q.replace("@search",search);
        }
        else{
            q = "select id,taikhoan,password from admin limit 10 offset @offset;";
        }

        if(page != undefined){
            currentpage = parseInt(page);
            q = q.replace("@offset",currentpage);
        }
        else
        {
            q =q.replace("@offset",currentpage);
        }


        console.log(q);
        //use the client for executing the query
        client.query(q, function(err, result) {
            //call `done(err)` to release the client back to the pool (or destroy it if there is an error)
            done(err);

            if(err) {
                return console.error('error running query', err);
            }

            console.log(result.rows);
            res.render("admin/ad_admin.ejs",{admins:result,mysearch:search,currentpage:currentpage
                ,num:result.rows.length,limit:10});

        });
    });

});

router.post('/admin/ad/add',function (req,res,next) {

    var taikhoan = req.body.taikhoan;
    var password = req.body.password;
    var mabimat = req.body.mabimat;

    var hashedPassword = passwordHash.generate(password);

    if(mabimat === 'mysupersecret') {
        pool.connect(function (err, client, done) {
            if (err) {
                return console.error('error fetching client from pool', err);
            }


            var q = "insert into admin(taikhoan,password) values ('@taikhoan','@password');"
            q = q.replace('@taikhoan', taikhoan);
            q = q.replace('@password', hashedPassword);

            console.log(q);
            //use the client for executing the query
            client.query(q, function (err, result) {
                //call `done(err)` to release the client back to the pool (or destroy it if there is an error)
                done(err);

                if (err) {
                    return console.error('error running query', err);
                }

                console.log(result.rows);
                res.redirect("/admin/ad")

            });
        });
    } else {
        res.send("access denied");
    }

});

router.post('/admin/ad/update',function (req,res,next) {

    var taikhoan = req.body.taikhoan;
    var password = req.body.password;
    var mabimat = req.body.mabimat;

    if(mabimat === 'mysupersecret') {

        pool.connect(function (err, client, done) {
            if (err) {
                return console.error('error fetching client from pool', err);
            }


            var q = "insert into admin(taikhoan,password) values ('@taikhoan','@password');"
            q = q.replace('@taikhoan', taikhoan);
            q = q.replace('@password', password);

            console.log(q);
            //use the client for executing the query
            client.query(q, function (err, result) {
                //call `done(err)` to release the client back to the pool (or destroy it if there is an error)
                done(err);

                if (err) {
                    return console.error('error running query', err);
                }

                console.log(result.rows);
                res.redirect("/admin/ad")

            });
        });
    }
    else
    {
        res.send("access denied");
    }

});


/*route for admin donhang*/
router.get('/admin/donhang',function (req,res,next){

    var search = req.query.q;

    var date_filter = req.query.date;
    var currentpage = 0;

    var page = req.query.page;
    var sess = req.session;
    if(sess.admin == undefined)
    {
        res.redirect("/admin");
    }
    pool.connect(function(err, client, done) {
        if(err) {
            return console.error('error fetching client from pool', err);
        }

        var q = "";
        if(date_filter != undefined && date_filter!= "") {
            q = "select madh,to_char(ngaythang,'DD/MM/YYYY') as ngaythang,somon,tongtien,ghichu,tinhtrang,makh " +
                "  from donhang order by abs(ngaythang - to_date('@filter','MM/DD/YYYY') )" +
                " limit 10 offset @offset;";
            q =q.replace("@filter",date_filter);
        }
        else {
            q = "select madh,to_char(ngaythang,'DD/MM/YYYY') as ngaythang,somon,tongtien,ghichu,tinhtrang,makh from donhang" +
                " limit 10 offset @offset;";
        }
        if(page != undefined)
        {
            currentpage = page;
            q= q.replace("@offset",currentpage);
        }
        else{
            q= q.replace("@offset",currentpage);
        }



        console.log(q);
        //use the client for executing the query
        client.query(q, function(err, result) {
            //call `done(err)` to release the client back to the pool (or destroy it if there is an error)
            done(err);

            if(err) {
                return console.error('error running query', err);
            }

            console.log(result.rows);

            var mmdd = "";
            if(date_filter != undefined){
                var spliter = date_filter.split("/");
                mmdd = spliter[1]+"/" +spliter[0] +"/"+spliter[2];
            }
            else{
                mmdd = date_filter;
            }

            res.render("admin/ad_donhang.ejs",{donhangs:result,date: mmdd,mysearch:search,currentpage:currentpage
                ,num:result.rows.length,limit:10});

        });
    });
});

router.get('/admin/donhang/check/:id',function (req,res,next) {

    var id = req.params.id;
    var old_tinhtrang = 0;
    pool.connect(function (err, client, done) {
        if (err) {
            return console.error('error fetching client from pool', err);
        }
        var q ="select tinhtrang from donhang where madh ="+id;
        console.log(q);
        var queryPreferences = client.query(q, function (err, result) {
            //call `done(err)` to release the client back to the pool (or destroy it if there is an error)


            if (err) {
                return console.error('error running query', err);
            }

            old_tinhtrang = result.rows[0].tinhtrang;
            console.log("tinh trang cu: "+ old_tinhtrang);

        });

        var updatetinhtrang = function () {

            var query = "";
            if(old_tinhtrang == '1')
                query = "update donhang set tinhtrang = '0' where madh = "+id;
            else if(old_tinhtrang == '0')
                query = "update donhang set tinhtrang = '1' where madh = "+id;

            var queryFoods = client.query(query);


            queryFoods.on('end', function () {

                done();

                res.redirect('/admin/donhang');


            });
        }

        queryPreferences.on('end', updatetinhtrang);

    })



});

router.get('/admin/donhang/:id',function (req,res,next){

    var id = req.params.id;
    var donhang = [];
    var ghichu = "";

    pool.connect(function(err, client, done) {
        if(err) {
            return console.error('error fetching client from pool', err);
        }

        var query = "select sanpham.tensp,sanpham.masp,mactdh,madh,soluong,ctdonhang.tinhtrang from ctdonhang left join sanpham on sanpham.masp = ctdonhang.masp where madh ="+id;

        console.log(query);
        var queryPreferences = client.query(query, function (err, result) {
            //call `done(err)` to release the client back to the pool (or destroy it if there is an error)
            /*  done(err);*/



            if (err) {
                return console.error('error running query', err);
            }


        });

        var getghichu = function () {

            var queryFoods = client.query("select ghichu from donhang where madh ="+id, function (err, resultstatus) {
                //call `done(err)` to release the client back to the pool (or destroy it if there is an error)
                /*   done(err);*/

                if (err) {
                    return console.error('error running query', err);
                }

            });

            queryFoods.on('row', function (row) {

                ghichu = row.ghichu;

            });
            queryFoods.on('end', function () {


                done();
                res.render("admin/ad_ctdonhang.ejs",{ctdonhang:donhang,ghichu:ghichu});
            });
        }
        queryPreferences.on('row',function (my) {
            console.log(my);
            donhang.push(my);
        });
        queryPreferences.on('end', getghichu);

        /*pool.connect(function(err, client, done) {
         if(err) {
         return console.error('error fetching client from pool', err);
         }

         var q ="select sanpham.tensp,sanpham.masp,mactdh,madh,soluong,ctdonhang.tinhtrang from ctdonhang left join sanpham on sanpham.masp = ctdonhang.masp where madh ="+id;

         console.log(q);
         //use the client for executing the query
         client.query(q, function(err, result) {
         //call `done(err)` to release the client back to the pool (or destroy it if there is an error)
         done(err);

         if(err) {
         return console.error('error running query', err);
         }

         console.log(result.rows);
         res.render("admin/ad_ctdonhang.ejs",{ctdonhang:result});

         });*/
    });
});

router.post('/admin/ctdh/update',function (req,res,next) {

    var mactdh = req.body.mactdh;
    var madh = req.body.madh;
    var tinhtrang = req.body.tinhtrang;
    var masp = req.body.masp;
    var soluong = req.body.soluong;
    var n = req.body.numchild;



    var query = " insert into ctdonhang(mactdh,madh,masp,soluong,tinhtrang) values ";
    for(var i =0;i< mactdh.length;i++)
    {
        var sub = "(@mactdh,@madh,@masp,@soluong,'@tinhtrang')";
        sub = sub.replace("@mactdh",mactdh[i]);
        sub = sub.replace("@madh",madh[i]);
        sub = sub.replace("@masp",masp[i]);
        sub = sub.replace("@soluong",soluong[i]);
        sub = sub.replace("@tinhtrang",tinhtrang[i]);

        query += sub;
        if(i != mactdh.length-1)
        {
            query+=", "
        }
        else
        {
            query+=";"
        }
    }

    pool.connect(function (err, client, done) {
        if (err) {
            return console.error('error fetching client from pool', err);
        }
        var q ="delete from ctdonhang where madh = "+madh[0];
        console.log(q);
        var queryPreferences = client.query(q, function (err, result) {
            //call `done(err)` to release the client back to the pool (or destroy it if there is an error)


            if (err) {
                return console.error('error running query', err);
            }

        });

        var updatectdh = function () {

            console.log("my query is :" +query);
            var queryFoods = client.query(query);


            queryFoods.on('end', function () {

                done();

                res.redirect('/admin/donhang');


            });
        }

        queryPreferences.on('end', updatectdh);

    })



});


//loai sp

router.get('/admin/loaisp',function (req,res,next) {
    var search = req.query.q;
    var page = req.query.page;

    var currentpage = 0;
    pool.connect(function(err, client, done) {
        if(err) {
            return console.error('error fetching client from pool', err);
        }

        var query ="";
        if(search == undefined) {
            query = "select mahxs,tenhxs from hangsanxuat where hidden = '0' order by mahxs limit 10 offset @offset";
        }
        else{
            query = "select mahxs,tenloai from hangsanxuat where hidden = '0' and LOWER(tenloai) like LOWER('%@search%') order by mahxs limit 10 offset @offset";
            query = query.replace("@search",search);
        }

        if(page != undefined)
        {
            currentpage = page;
            query= query.replace("@offset",currentpage);
        }
        else
        {
            query= query.replace("@offset",currentpage);
        }
        console.log(query);
        //use the client for executing the query
        client.query(query , function(err, result) {
            //call `done(err)` to release the client back to the pool (or destroy it if there is an error)
            done(err);

            if(err) {
                return console.error('error running query', err);
            }

            res.render("admin/ad_loaisp.ejs",{loais:result,mysearch:search,currentpage:currentpage
                ,num:result.rows.length,limit:10})

        });
    });


});

router.post('/admin/loaisp/add',function (req,res,next) {


    var tenloai = req.body.tenloai;
    var hidden = req.body.hidden;

    var currentpage = 0;
    pool.connect(function(err, client, done) {
        if(err) {
            return console.error('error fetching client from pool', err);
        }

        var query = "insert into hangsanxuat(tenhxs,hidden) values ('@tenloai','@hidden');";
        query = query.replace("@tenloai",tenloai);
        query = query.replace("@hidden",hidden);
        console.log(query);
        //use the client for executing the query
        client.query(query , function(err, result) {
            //call `done(err)` to release the client back to the pool (or destroy it if there is an error)
            done(err);

            if(err) {
                return console.error('error running query', err);
            }

            res.redirect("/admin/loaisp");

        });
    });


});

router.post('/admin/loaisp/update',function (req,res,next) {

    var maloai = req.body.maloai;
    var tenloai = req.body.tenloai;

    var currentpage = 0;
    pool.connect(function(err, client, done) {
        if(err) {
            return console.error('error fetching client from pool', err);
        }

        var query = "update hangsanxuat set tenhxs = '@tenloai' where mahxs = @maloai;";
        query = query.replace("@tenloai",tenloai);
        query = query.replace("@maloai",maloai);
        //use the client for executing the query
        client.query(query , function(err, result) {
            //call `done(err)` to release the client back to the pool (or destroy it if there is an error)
            done(err);

            if(err) {
                return console.error('error running query', err);
            }

            res.redirect("/admin/loaisp");

        });
    });


});

router.post('/admin/loaisp/hidden',function (req,res,next) {

    var maloai = req.body.delid;

    var currentpage = 0;
    pool.connect(function(err, client, done) {
        if(err) {
            return console.error('error fetching client from pool', err);
        }

        var query = "update hangsanxuat set hidden = '1' where mahxs = @maloai;";
        query = query.replace("@maloai",maloai);
        console.log(query);
        //use the client for executing the query
        client.query(query , function(err, result) {
            //call `done(err)` to release the client back to the pool (or destroy it if there is an error)
            done(err);

            if(err) {
                return console.error('error running query', err);
            }

            res.redirect("/admin/loaisp");

        });
    });


});

module.exports = router;


