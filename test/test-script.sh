read -p $'\nStart Test: The test only test Post/Put for the web application
            Since GET will render the page for ejs View (it will show html code during testing)
            Which does not for the purpose of testing'


read -p $'\nCreate user'
curl -X "POST" "http://localhost:3000/users" \
     -H "Content-Type: application/json; charset=utf-8" \
     -d $'{
  "name": "Edwin Zhang",
  "email": "zhang.yuxuan@hotmail.com",
  "phone": "6479865418",
  "password": "123",
  "password_2": "123"
}'

read -p $'\nLog in by created user'
curl -c cookies.txt\
     -X "POST" "http://localhost:3000/login" \
     -H "Content-Type: application/json; charset=utf-8" \
     -d $'{
  "email": "zhang.yuxuan@hotmail.com",
  "password": "123"
}'


read -p $'\nUpdate user'
curl -b cookies.txt -c cookies.txt\
     -X "PUT" "http://localhost:3000/users/update" \
     -H "Content-Type: application/json; charset=utf-8" \
     -d $'{
 "name": "Edwin Zhang Updated",
 "phone": "6471000000",
 "password": "1234",
 "password_2": "1234"
}'

read -p $'\nAdd a Book Manually'
curl -b cookies.txt -c cookies.txt\
     -X "POST" "http://localhost:3000/books" \
     -H "Content-Type: application/json; charset=utf-8" \
     -d $'{
  "bookname": "Programming on the web",
  "author": "Amir",
  "ISBN": "123456",
  "price": "50",
  "courseCode": "csc309",
  "condition": "4",
  "description": "Test Description"
}'

read -p $'\nAdd a Book By ISBN'
curl -b cookies.txt -c cookies.txt\
     -X "POST" "http://localhost:3000/books/ISBN" \
     -H "Content-Type: application/json; charset=utf-8" \
     -d $'{
  "ISBN_autofill": "0735619670",
  "price_autofill": "30",
  "courseCode_autofill": "csc309",
  "condition_autofill": "3"
}'


read -p $'\nUpdate a Book'
curl -b cookies.txt -c cookies.txt\
     -X "PUT" "http://localhost:3000/books/update/1" \
     -H "Content-Type: application/json; charset=utf-8" \
     -d $'{
     "bookname": "Software Development",
     "author": "Edwin",
     "ISBN": "000000",
     "price": "40",
     "courseCode": "csc444",
     "condition": "2",
     "description": "Test Description"
}'

read -p $'\nAdd a Review Anonymously to seller'
curl -b cookies.txt -c cookies.txt\
  -X "POST" "http://localhost:3000/review/1" \
  -H "Content-Type: application/json; charset=utf-8" \
  -d $'{
      "rate" : "4",
      "review" : "The seller is awesome!"
}'

read -p $'\nUpdate a Book to sold'
curl -b cookies.txt -c cookies.txt\
     -X "PUT" "http://localhost:3000/books/sold/1" \
     -H "Content-Type: application/json; charset=utf-8"

read -p $'\n\nFinish All the Test'
