#!/usr/bin/env bash
#
# SwiftPass Digital Test script.

color="\033[95m"
reset="\033[0m"
width=100
# cols=$(tput cols)

API_PORT=$1
API_URL="http://localhost:$API_PORT"

# User registration.
userReg() {
    curl -X POST \
        "$API_URL/users/register" \
        -H 'Content-Type: application/json' \
        -d '{
            "first_name": "Chevy",
            "last_name": "Woods",
            "user_name": "chevvywoods",
            "email": "chevvywoods@gmail.com",
            "telephone": "0789445327",
            "password": "123456789"
        }'
}

userLogin() {
    curl -X POST \
        "$API_URL/users/login" \
        -H 'Content-Type: application/json' \
        -d '{
            "email": "chevvywoods@gmail.com",
            "password": "123456789"
        }'
}

orgRegistration() {
    curl -X POST \
        "$API_URL/organization/registration" \
        -H 'Content-Type: application/json' \
        -d '{
            "organization_name": "Crawford School",
            "org_email": "crawfordschool@example.com",
            "org_pwd": "123456789",
            "country": "Kenya"
        }'
}

orgLogin() {
    curl -X POST \
        "$API_URL/organization/admin" \
        -H 'Content-Type: application/json' \
        -d '{
            "org_email": "crawfordschool@example.com",
            "org_pwd": "123456789"
        }'

}

createEvent() {
    curl -X POST \
        "$API_URL/events/create" \
        -H 'Content-Type: application/json' \
        -d '{
            "owner_id": "2b7992ad-223b-40b6-a66a-a0b0567de0e7",
            "title": "Kiambu level 2 Swimming Championship",
            "description": "Kiambu county regional swimming gala",
            "venue": "Mpesa Foundation Academy",
            "start_date": "2025-09-18T10:15:30Z",
            "finish_date": "2025-09-19T10:15:30Z",
            "event_tag": "Swimming"
        }'
}

listEvents() {
    curl -X GET "$API_URL/events/list" 
}

eventInfo() {
    curl -X GET "$API_URL/events/5f51badb-acfe-4b0f-8b9d-6a2d96a5fd1e"
}

# List events for a particular organization.
listMyEvents() {
    curl -X GET "$API_URL/events/myevents/2b7992ad-223b-40b6-a66a-a0b0567de0e7"
}

createTicket() {
    curl -X POST \
        "$API_URL/events/ticket/create" \
        -H 'Content-Type: application/json' \
        -d '{
            "event_id": "5f51badb-acfe-4b0f-8b9d-6a2d96a5fd1e",
            "base_price": "1000",
            "capacity": 300,
            "ticket_type": "Regular",
            "ticket_class": "Individual",
            "discount_time": 3,
            "start_time": "2025-09-18T10:15:30Z",
            "finish_time": "2025-09-18T10:15:30Z",
            "description": "Athletics event at Kasarani"
        }'
}


listTickets() {
    curl -X GET "$API_URL/events/ticket/list/5f51badb-acfe-4b0f-8b9d-6a2d96a5fd1e"
}

singleTicket() {
    curl -X GET "$API_URL/events/ticket/8bc51b2b-62d8-45ff-89ee-6191d702093f"
}

# We are making an order here
purchaseTicket() {
    curl -X POST \
        "$API_URL/events/ticket/order/purchase/8bc51b2b-62d8-45ff-89ee-6191d702093f" \
        -H 'Content-Type: applicatoin/json' \
        -d '{
            "user_email": "abracadabra@gmail.com",
            "user_contact": "0757894326"
        }'
}

# Checking an order with entrance code
checkTicketOrder() {
    curl -X GET "$API_URL/events/ticket/order/8bc51b2b-62d8-45ff-89ee-6191d702093f?entrance_code=W9FG26KJ"
}

# Verifying the ticket order.
verifyTicket() {
    curl -X PATCH \
        "$API_URL/events/ticket/order/verify/5f1b1eb1-e6b2-4c2a-8c9d-774c0e7efa08/7a7e1889-0e7a-4656-99d6-13856b387bcc" \
        -H 'Content-Type: application/json' \
        -d '{
            "ticket_status": "Checked"
        }'
}

printf "${color}%*s${reset}\n" "$width" '' | tr ' ' '='
echo "Testing SwiftPassDigital Software"
result=$(listMyEvents)
echo "$result" | jq
printf "${color}%*s${reset}\n" "$width" '' | tr ' ' '='

