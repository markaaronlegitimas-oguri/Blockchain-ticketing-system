// SPDX-License-Identifier: MIT
pragma solidity 0.8.29;

contract TheaterManager {
    address public owner;

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "You are not allowed here!");
        _;
    }

    struct Event {
        uint256 id;
        string name;
        uint256 date;
        uint256 ticketPrice;
        uint256 availableTickets;
        bool active;
    }

    struct Ticket {
        uint256 eventId;
        address owner;
        bool valid;
    }

    uint256 public eventCounter;
    uint256 public ticketCounter;
    mapping(uint256 => Event) public events;
    mapping(uint256 => Ticket) public tickets;
    mapping(address => uint256[]) public userTickets;

    event EventCreated(
        uint256 id,
        string name,
        uint256 date,
        uint256 price,
        uint256 tickets
    );
    event TicketPurchased(uint256 ticketId, uint256 eventId, address buyer);
    event TicketTransferred(uint256 ticketId, address newOwner);
    event EventCancelled(uint256 id);

    function createEvent(
        string memory _name,
        uint256 _date,
        uint256 _price,
        uint256 _tickets
    ) public onlyOwner {
        // price expressed in ether
        events[eventCounter] = Event(
            eventCounter,
            _name,
            _date,
            _price * 1 ether,
            _tickets,
            true
        );

        emit EventCreated(
            eventCounter,
            _name,
            _date,
            _price * 1 ether,
            _tickets
        );
        eventCounter++;
    }

    function purchaseTicket(uint256 _eventId) public payable {
        Event storage event_ = events[_eventId];
        require(event_.active, "Event not available");
        require(event_.availableTickets > 0, "Tickets are sold out!");
        require(msg.value == event_.ticketPrice, "Incorrect ticket price");

        event_.availableTickets--;
        tickets[ticketCounter] = Ticket(_eventId, msg.sender, true);
        userTickets[msg.sender].push(ticketCounter);

        emit TicketPurchased(ticketCounter, _eventId, msg.sender);
        ticketCounter++;
    }

    function verifyTicket(
        uint256 _ticketId
    ) public view onlyOwner returns (bool) {
        return tickets[_ticketId].valid;
    }

    function transferTicket(uint256 _ticketId, address _newOwner) public {
        require(
            tickets[_ticketId].owner == msg.sender,
            "You are not the owner of the ticket"
        );

        uint256[] storage senderTickets = userTickets[msg.sender];
        for (uint256 i = 0; i < senderTickets.length; i++) {
            if (senderTickets[i] == _ticketId) {
                senderTickets[i] = senderTickets[senderTickets.length - 1];
                senderTickets.pop();
                break;
            }
        }

        userTickets[_newOwner].push(_ticketId);

        tickets[_ticketId].owner = _newOwner;

        emit TicketTransferred(_ticketId, _newOwner);
    }

    function cancelEvent(uint256 _eventId) public onlyOwner {
        Event storage event_ = events[_eventId];
        require(event_.active, "Event already cancelled");
        event_.active = false;

        for (uint256 i = 0; i < ticketCounter; i++) {
            if (tickets[i].eventId == _eventId && tickets[i].valid) {
                tickets[i].valid = false;
                payable(tickets[i].owner).transfer(event_.ticketPrice);
            }
        }

        emit EventCancelled(_eventId);
    }

    function getUserTickets(address user) public view returns (uint256[] memory) {
        return userTickets[user];
    }
}
