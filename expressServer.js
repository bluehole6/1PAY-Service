const express = require('express')
const app = express()
const path =require('path')
var request = require('request')
var mysql = require('mysql');
var jwt = require('jsonwebtoken') // 토큰 생성
var auth = require('./lib/auth') // 미들웨어 경로
var require = require('date-utils') // 시간 양식

// 데이터베이스 연결
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'q1591215',
  database : 'fintech'
});
 
connection.connect();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs'); 

app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json());
app.use(express.urlencoded({extended:false}));

app.get('/', function (req, res) {
  res.send('login')
})

app.get('/scan', function (req, res) {
    res.render("scan")
})

// auth 라는 하나의 검증 단계를 추가함
app.post('/authTest', auth, function(req, res){
    res.json(req.decoded)
})

// ---------------services start------------

app.get('/signup', function(req, res){
    res.render('signup')
})

app.get('/login', function(req, res){
    res.render('login')
})

app.get('/main', function(req, res){
    res.render('main')
})

app.get('/balance', function(req, res){
    res.render('balance')
})

app.get('/qrcode', function(req, res){
    res.render('qrcode')
})

app.get('/qrreader', function(req, res){
    res.render('qrreader')
})

app.get('/qr_info', function(req, res){
    res.render('qr_info')
})

app.get('/check', function(req, res){
    res.render('check')
})

app.get('/withdraw', function(req, res){
    res.render('withdraw')
})

// 사용자 인증 과정
app.get('/authResult', function (req, res) {
    var authCode = req.query.code; // 생성된 uri에서 query를 가져옴
    console.log(authCode);

    // POST 메소드 일때 form
    var option = {
        method : "POST",
        url : "https://testapi.openbanking.or.kr/oauth/2.0/token",
        header : {
            'Content-Type' : 'application/x-www-form-urlencoded'
        },
        form : {
            code : authCode,
            client_id: 'WJejG21ttsj2BsEZWMRzQGH4FkzR1n4uBCQ578Wv',
            client_secret: 'bS0aR0xz8yfsn4Yth1inX8Fcmun4j9V44LtzuHTE',
            redirect_uri : 'http://localhost:3000/authResult',
            grant_type : 'authorization_code'
        }
    }

    request(option, function(err, response, body){
        if(err){
            console.log(err);
            throw err;
        }
        else{
            console.log(body);
            var accessRequestResult = JSON.parse(body);
            console.log(accessRequestResult.access_token);

            res.render('resultChild', {data : accessRequestResult})
        }
    })

})

app.get('/authResult2', function (req, res) {
    var authCode = req.query.code; // 생성된 uri에서 query를 가져옴
    console.log(authCode);

    // POST 메소드 일때 form
    var options = {
        'method': 'POST',
        'url': 'https://testapi.openbanking.or.kr/oauth/2.0/token',
        'headers': {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Cookie': '_xm_webid_1_=1996433933'
        },
        form: {
          'client_id': 'WJejG21ttsj2BsEZWMRzQGH4FkzR1n4uBCQ578Wv',
          'client_secret': 'bS0aR0xz8yfsn4Yth1inX8Fcmun4j9V44LtzuHTE',
          'scope': 'oob',
          'grant_type': 'client_credentials'
        }
    };

    request(option, function(err, response, body){
        if(err){
            console.log(err);
            throw err;
        }
        else{
            console.log(body);
            var accessRequestResult = JSON.parse(body);
            console.log(accessRequestResult.access_token);

            res.render('resultChild', {data : accessRequestResult})
        }
    })

})


// 회원가입 - 데이터 받아오기 (signup.ejs - ajax)
app.post('/signup', function(req, res){
    var userName = req.body.userName;
    var userEmail = req.body.userEmail;
    var userPassword = req.body.userPassword;
    var userAccessToken = req.body.userAccessToken;
    var userRefreshToken = req.body.userRefreshToken;
    var userSeqNo = req.body.userSeqNo;

    console.log(req.body);
    var sql = "INSERT INTO fintech.user (name, email, password, accesstoken, refreshtoken, userseqno) VALUES (?,?,?,?,?,?)"

    var user_data = [userName, userEmail, userPassword, userAccessToken, userRefreshToken, userSeqNo];

    // 회원가입 데이터 저장
    connection.query(sql, user_data, function(err, result){
        console.log(sql);
        console.log(result);
        if(err){
            console.log(err);
            res.json(0);
            throw err;
        }
        else{
            res.json(1);
            
        }
    })

})

// 로그인 
app.post('/login', function(req, res){
    var userEmail = req.body.userEmail;
    var userPassword = req.body.userPassword;
    console.log(userEmail, userPassword)
    var sql = "SELECT * FROM user WHERE email = ?";
    connection.query(sql, [userEmail], function(err, result){
        if(err){
            console.error(err);
            res.json(0);
            throw err;
        }
        else {
            console.log(result);
            if(result.length == 0){
                res.json(3)
            }
            else {
                var dbPassword = result[0].password;
                if(dbPassword == userPassword){
                    var tokenKey = "f@i#n%tne#ckfhlafkd0102test!@#%"
                    jwt.sign(
                      {
                          userId : result[0].id,
                          userEmail : result[0].email
                      },
                      tokenKey,
                      {
                          expiresIn : '10d',
                          issuer : 'fintech.admin',
                          subject : 'user.login.info'
                      },
                      function(err, token){
                          console.log('로그인 성공', token)
                          res.json(token)
                      }
                    )            
                }
                else {
                    res.json(2);
                }
            }
        }
    })
})

// 등록 계좌 리스트 불러오기
app.post('/list', auth, function(req, res){

    // api response body
    console.log(req);
    var userEmail = req.decoded.userEmail;
    var sql = "SELECT * FROM user WHERE email = ?"
    connection.query(sql,[userEmail], function(err , result){
        if(err){
            console.error(err);
            throw err
        }
        else {
            console.log(result);
            var option = {
                method : "GET",
                url : "https://testapi.openbanking.or.kr/v2.0/user/me",
                headers : {
                    Authorization : 'Bearer ' + result[0].accesstoken
                },
                qs : {
                    user_seq_no : result[0].userseqno
                }
            }
            request(option, function(err, response, body){
                if(err){
                    console.error(err);
                    throw err;
                }
                else {
                    var accessRequestResult = JSON.parse(body);
                    console.log(accessRequestResult);
                    res.json(accessRequestResult)
                }
            })
        }
    })
})

// 계좌 잔액 확인
app.post("/balance", auth, function(req, res){
    var userEmail = req.decoded.userEmail;
    var fin_use_num = req.body.fin_use_num;

    var countnum = Math.floor(Math.random() * 1000000000) + 1;
    var transId = "T991628890U" + countnum; //이용기관번호 본인것 입력

    var sql = "SELECT * FROM user WHERE email = ?"
    connection.query(sql,[userEmail], function(err , result){
        if(err){
            console.error(err);
            throw err
        }
        else {
            console.log(result);
            var option = {
                method : "GET",
                url : "https://testapi.openbanking.or.kr/v2.0/account/balance/fin_num",
                headers : {
                    Authorization : 'Bearer ' + result[0].accesstoken
                },
                qs : {
                    bank_tran_id : transId,
                    fintech_use_num : fin_use_num,
                    tran_dtime : '20200515114200'
                }
            }
            request(option, function(err, response, body){
                if(err){
                    console.error(err);
                    throw err;
                }
                else {
                    var accessRequestResult = JSON.parse(body);
                    console.log(accessRequestResult);
                    res.json(accessRequestResult)
                }
            })
        }
    })
 
})

// 이체 내역 확인
app.post("/transactionlist", auth, function(req, res){
    var userEmail = req.decoded.userEmail;
    var fin_use_num = req.body.fin_use_num;
    var countnum = Math.floor(Math.random() * 1000000000) + 1;
    var transId = "T991628890U" + countnum; //이용기과번호 본인것 입력
    var inquiry_t = "A";
    var inquiry_b = "D";
    var from_date = "20200515";
    var to_date = "20200515";
    var sort_order = "D";
    var tran_dtime = "20200515133200";

    var sql = "SELECT * FROM user WHERE email = ?"

    connection.query(sql,[userEmail], function(err , result){
        if(err){
            console.error(err);
            throw err
        }
        else {
            console.log(result);
            var option = {
                method : "GET",
                url : "https://testapi.openbanking.or.kr/v2.0/account/transaction_list/fin_num",
                headers : {
                    Authorization : 'Bearer ' + result[0].accesstoken
                },
                qs : {
                    bank_tran_id : transId,
                    fintech_use_num : fin_use_num,
                    inquiry_type : inquiry_t,
                    inquiry_base : inquiry_b,
                    from_date : from_date,
                    to_date : to_date,
                    sort_order : sort_order,
                    tran_dtime : tran_dtime
                }
            }
            request(option, function(err, response, body){
                if(err){
                    console.error(err);
                    throw err;
                }
                else {
                    var accessRequestResult = JSON.parse(body);
                    console.log(accessRequestResult);
                    res.json(accessRequestResult)
                }
            })
        }
    })
})

// 계좌 이체
app.post("/withdraw", auth, function(req, res){
    
    console.log("withdraw")
    
    var userEmail = req.decoded.userEmail
    var countnum = Math.floor(Math.random() * 1000000000) + 1;
    var transId = "T991628890U" + countnum; //이용기과번호 본인것 입력
    
    var newDate = new Date(); 
    var time = newDate.toFormat("YYYYMMDDHH24MISS");  

    var worker_name = req.body.name
    var worker_bank_code = req.body.bank_code
    var worker_account_num = req.body.account_num
    var worker_expect_time = req.body.expect_time
    var worker_hourly = req.body.hourly

    var tran_amt = worker_expect_time * worker_hourly

    console.log(worker_name);
    console.log(worker_bank_code);
    console.log(worker_account_num);
    
    var sql = "SELECT * FROM user WHERE email = ?"


    connection.query(sql, [userEmail], function(err , result){
        if(err){
            console.error(err);
            throw err
        }
        else {
            console.log("----------------------" + result);
            var option = {
                method : "POST",
                url : "https://testapi.openbanking.or.kr/v2.0/transfer/withdraw/fin_num",
                headers : {
                    'Content-Type' : 'application/json, charset=UTF-8',
                    Authorization : 'Bearer ' + result[0].accesstoken
                },
                json : {
                    "bank_tran_id" : transId,
                    "cntr_account_type" : "N",
                    "cntr_account_num" : "9253593186",
                    "dps_print_content" : "노동자 급여",
                    "fintech_use_num" : "199162889057883841731471",
                    "tran_amt" : tran_amt,
                    "tran_dtime" : time,
                    "req_client_name" : "쿠팡",
                    "req_client_fintech_use_num" : "199162889057883841731471",
                    "req_client_num" : "HONGGILDONG1234",
                    "transfer_purpose" : "TR",
                    "recv_client_name" : "장윤혁",
                    "recv_client_bank_code" : "097",
                    "recv_client_account_num" :  "9253593186"
                }
            }

            request(option, function(err, response, body){
                var withdrawResult = body;
                if(err){
                    console.error(err);
                    throw err;
                }
                else {
                    
                    console.log(body);
                    console.log(body.bank_tran_id);    
                    
                    
                    if(body.rsp_code == "A0000"){
                        console.log("-----------이체 성공-----------");
                        // DB 저장
                        var trans_id = body.api_tran_id
                        var dps_account_holder_name = body.dps_account_holder_name
                        var dps_bank_name = body.dps_bank_name
                        var dps_account_num_masked = body.dps_account_num_masked
                        var tran_amt = body.tran_amt
                        var wd_limit_remain_amt = body.wd_limit_remain_amt

                        

                        console.log("----?????")
                        console.log(req.body)
                        var val = [trans_id, worker_name, worker_bank_code, worker_account_num, dps_account_holder_name, dps_bank_name, dps_account_num_masked, tran_amt, wd_limit_remain_amt]

                        for(var i=0; i<val.length;i++){
                            console.log(val[i])
                        }

                        var sql1 = "SELECT * FROM withdraw_record WHERE trans_id = ? AND worker_name = ? AND worker_account_num = ?"
                        var sql2 = "INSERT INTO withdraw_record(trans_id, worker_name, worker_bank_code, worker_account_num, dps_account_holder_name, dps_bank_name, dps_account_num_masked, tran_amt, wd_limit_remain_amt) VALUES (?,?,?,?,?,?,?,?,?)"
                        
                        connection.query(sql1, [trans_id, worker_name, worker_account_num], function(err , result){
                            if(err){
                                console.log(err)
                                throw err
                            }else{
                                console.log("??????????????????????????????????????????")
                                console.log(result)
                            }
                            
                            if(result == ""){
                                connection.query(sql2, val, function(err , result){
                                    if(err){
                                        console.log(err)
                                        throw err
                                    }else{
                                        console.log("-----------------------------------------------")
                                        console.log(result)
                                        res.send({result : "success", tran_amt})
                                    }
                                    
                                })
                            }
                        })
                        
                    }else{
                        console.log("-----------이체 실패-----------")
                    }
                    
                }
            })
        }
    })    
})


// 출퇴근 시에 QR코드 읽고 데이터 저장
// 그 과정에서 이체하기
app.post("/qr_info", function(req, res){

    // 한글 인코딩 문제 발생
    var userData = req.body.user_data;
    console.log(userData)
    var strArr = userData.split(',');
    var userName = strArr[0];
    var userBank = strArr[1];
    var userAccount = strArr[2];
    var userExpectTime = strArr[3];
    var userHourly = strArr[4];

    for(var i = 0; i < strArr.length; i++){
        console.log(strArr[i])
    }
    //날짜 생성
   

    // 이미 DB에 저장이 되어있는지 확인
    var sql1 = "SELECT * FROM worker_start WHERE name = ? AND account_num = ?"
    var sql2 = "INSERT INTO worker_start(name, bank_code, account_num, expect_time, hourly, start_time) VALUES(?,?,?,?,?,?)"
    
    
    connection.query(sql1, [userName, userAccount], function(err , result1){
        // 출근할 때(데이터가 없으면 노동자 데이터 추가)
        if(result1 == ""){

            var start_time = new Date(); // 시작 시간
            var userData = [userName,userBank, userAccount, userExpectTime, userHourly, start_time];

            connection.query(sql2, userData, function(err , result){
                if(err){
                    console.error(err);
                    throw err
                }
                else {
                    console.log("출근 추가")
                    res.send({result :"success", userName})
                }
            })
        }
        else if(err){
            console.error(err);
            throw err
        }
        // 퇴근할 때(데이터가 없으면 노동자 데이터 추가)
        else{
            console.log("존재")

            var sql3 = "SELECT * FROM worker_end WHERE name = ? AND account_num = ?"
            var sql4 = "INSERT INTO worker_end(name, account_num, end_time) VALUES(?,?,?)"

            // 퇴근 시간 - 출근 시간 = 총 근무 시간
            // 확인 후, 총 근무 시간이 정확하면 출금 이체
        
            // 퇴근 테이블에 존재하는지 / 이미 찍었는지
            connection.query(sql3, [userName, userAccount], function(err , result){

                var end_time = new Date()
                var userData = [userName, userAccount, end_time];
                
                // 퇴근할 때(데이터가 없으면 노동자 데이터 추가)
                if(result == ""){           
                    connection.query(sql4, userData, function(err , result){
                        if(err){
                            console.error(err);
                            throw err
                        }
                        else {
                            console.log("퇴근 추가")
                            // 출근 데이터 삭제
                            // 출금이체 확인 동의

                            // 출근 시간 가져오기
                            var sql5 = "SELECT start_time, expect_time FROM worker_start WHERE name = ? AND account_num = ?"
                            connection.query(sql5, [userName, userAccount], function(err , result){
                                var expect_time = result[0].expect_time
                                // 근무시간 확인
                                if(result != ""){           
                                    start_time = result[0].start_time
                                    console.log(start_time)          
                                    console.log(end_time)
                                    var total_minutes = (end_time.getTime() - start_time.getTime()) / 60000
                                    var total_hours = (total_minutes - (total_minutes % 60)) / 60
                                    console.log("총 근무 시간 : " + total_hours + "시간" + (total_minutes % 60).toFixed(0) + "분 입니다.")

                                    var time = ((end_time.getTime() - start_time.getTime()) / 60000) - 60*total_hours
                                    
                                    console.log("------------time---------------")
                                    console.log(time)
                                    // 계약 근로 시간과 실 근로 시간과 맞는지 확인
                                    
                                    if(8 == expect_time){
                                        var sql = "SELECT * FROM withdraw_record WHERE worker_name = ? AND worker_account_num = ?"
                                        var newDate = new Date();
                                        var time = newDate.toFormat("YYYYMMDDHH24MISS"); 
                                        var countnum = Math.floor(Math.random() * 1000000000) + 1;
                                        var transId = "T991628890U" + countnum; //이용기과번호 본인것 입력

                                        //출금이체 테이블에 있는지 확인
                                        connection.query(sql, [userName, userAccount], function(err , result1){
                                            if(err){
                                                console.error(err);
                                                throw err
                                            }
                                            else {
                                                console.log("checked withdraw.")

                                                var option = {
                                                    method : "POST",
                                                    url : "https://testapi.openbanking.or.kr/v2.0/transfer/deposit/acnt_num",
                                                    headers : {         //고정값
                                                        Authorization : 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJUOTkxNjI4ODkwIiwic2NvcGUiOlsib29iIl0sImlzcyI6Imh0dHBzOi8vd3d3Lm9wZW5iYW5raW5nLm9yLmtyIiwiZXhwIjoxNTk3ODMwNTc4LCJqdGkiOiI1Yzg4NTA1NC05N2QzLTQ5YjYtOWI1MS04NzA0NTljNjY2MzYifQ.gLnWWL3S04NX8xzlGCEoXrV_9TEsuAJ4DXxgKDvuoZY',
                                                        "Content-Type" : "application/json"
                                                    },
                                                    json:{
                                                        cntr_account_type : "N",
                                                        cntr_account_num : "2594999894",   //빠져나갈 계좌
                                                        wd_pass_phrase : "NONE",
                                                        wd_print_content : "노동금액출금",
                                                        name_check_option : "on",
                                                        tran_dtime : time,
                                                        req_cnt :"1",
                                                        req_list :[
                                                        {
                                                            tran_no : "1",
                                                            bank_tran_id : transId,
                                                            bank_code_std: "097",
                                                            account_num : "123123123",
                                                            account_holder_name :"장윤혁",
                                                            print_content:"급여 지급",
                                                            tran_amt : result1[0].tran_amt,
                                                            req_client_name : "쿠팡",
                                                            req_client_account_num : result1[0].worker_account_num,    //입금계좌
                                                            req_client_bank_code : result1[0].worker_bank_code,
                                                            req_client_num : "HONGGILDONG1234",
                                                            transfer_purpose : "TR"
                                                        }]
                                                    }  
                                                }
                                                request(option, function(err, response, body){
                                                    if(err){
                                                        console.error(err);
                                                        throw err;
                                                    }
                                                    else {
                                                        console.log(body);
                                                        if(body.rsp_code == 'A0000'){
                                                            res.json(1)
                                                            var sql = "INSERT INTO deposit_record (api_tran_id, wd_account_holder_name, wd_account_num_masked, tran_amt) VALUES (?,?,?,?)"
                                                            connection.query(sql, [body.api_tran_id, "Will Smith", body.res_list[0].account_num, body.res_list[0].tran_amt],
                                                                function(err, result){
                                                                    if(err){
                                                                        console.error(err);
                                                                        throw err;
                                                                    }
                                                                    else{
                                                                        console.log("success")
                                                                    }
                                                                })
                                                        }
                                                    }
                                                })
                                            }
                                        })
                                    }
                                    else{

                                    }
                                    // 확인 후, 출금 이체 동의

                                    // 일당 구하기, 초과 근무, 야간 근무

                                    var hourly = 9000
                                    var minutely = 9000 / 60
                                    var overtime_hours, overtime_minutes, overtime_wage, total_wage
                                    var regexp = /\B(?=(\d{3})+(?!\d))/g;
                                    



                                    /*
                                    if(total_hours >= 8){
                                        console.log("하루 8시간 기준 초과하였습니다. 초과 수당 해당자 입니다.")
                                        overtime_hours = total_hours - 8
                                        overtime_minutes = (total_minutes % 60).toFixed(0)
                                        overtime_wage = (hourly * 1.5 * overtime_hours) + (minutely * 1.5 * overtime_minutes)
                                        total_wage = (8 * hourly + overtime_wage).toFixed(0)
                                        // 확인해야 함
                                        console.log("일당 : " + total_wage.toString().replace(regexp, ',') + "원.")
                                        console.log("시급 : " + hourly.toString().replace(regexp, ',') + "원.")
                                    }
                                    else{
                                        total_wage = (total_hours * hourly).toFixed(0)
                                        console.log("일당 : " + total_wage.toString().replace(regexp, ',') + "원.")
                                        console.log("시급 : " + hourly.toString().replace(regexp, ',') + "원.")
                                    
                                    }
                                    */



                                }else if(err){
                                    console.log(err)
                                    throw err
                                }
                                else{

                                }
                            })
                        }
                    })
                }
                else if(err){
                    console.error(err);
                    throw err
                }
                // 퇴근할 때(데이터가 이미 있을 경우)
                else{
                    console.log("에러 - 이미 퇴근했습니다.")                                      
                }   
            })
        }   
    })
})

// 이체 내역 확인
app.post("/check", function(req, res){

    var sql = "SELECT * FROM worker_start"
    connection.query(sql, function(err , result){
        if(err){
            console.error(err);
            throw err
        }
        else {
            console.log(result)
            res.send({check:"success", result})
        }
    })
 
})

app.listen(3000)