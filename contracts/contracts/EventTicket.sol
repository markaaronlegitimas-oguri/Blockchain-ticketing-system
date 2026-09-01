// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract EventTicket {
    enum TicketStatus { Unsold, Sold, Used, Cancelled, Refunded }

    struct Ticket {
        uint256 id;
        address owner;
        TicketStatus status;
        uint256 purchasePrice;
    }

    address public organizer;
    string public eventName;
    uint256 public ticketPrice;
    uint256 public maxTickets;
    uint256 public ticketsIssued;
    bool public eventCancelled;

    mapping(uint256 => Ticket) public tickets;
    mapping(address => uint256[]) public ticketsOwnedBy;

    event TicketIssued(uint256 indexed ticketId, address indexed owner, uint256 price);
    event TicketPurchased(uint256 indexed ticketId, address indexed buyer, uint256 price);
    event TicketTransferred(uint256 indexed ticketId, address indexed from, address indexed to);
    event TicketValidated(uint256 indexed ticketId, address indexed validator);
    event TicketCancelled(uint256 indexed ticketId, address indexed owner, uint256 refundAmount);
    event EventCancelledAndRefunded();

    modifier onlyOrganizer() {
        require(msg.sender == organizer, "Only organizer can perform this action");
        _;
    }

    modifier ticketExists(uint256 ticketId) {
        require(ticketId < ticketsIssued, "Ticket does not exist");
        _;
    }

    modifier eventNotCancelled() {
        require(!eventCancelled, "Event has been cancelled");
        _;
    }

    constructor(string memory _eventName, uint256 _ticketPrice, uint256 _maxTickets) {
        require(_maxTickets > 0, "maxTickets must be > 0");
        organizer = msg.sender;
        eventName = _eventName;
        ticketPrice = _ticketPrice;
        maxTickets = _maxTickets;
    }

    function issueTickets(uint256 count) external onlyOrganizer eventNotCancelled {
        require(ticketsIssued + count <= maxTickets, "Exceeds max ticket supply");
        for (uint256 i = 0; i < count; i++) {
            uint256 newId = ticketsIssued;
            tickets[newId] = Ticket({ id: newId, owner: organizer, status: TicketStatus.Unsold, purchasePrice: 0 });
            ticketsIssued++;
            emit TicketIssued(newId, organizer, ticketPrice);
        }
    }

    function purchaseTicket(uint256 ticketId) external payable ticketExists(ticketId) eventNotCancelled {
        Ticket storage t = tickets[ticketId];
        require(t.status == TicketStatus.Unsold, "Ticket is not available for purchase");
        require(msg.value == ticketPrice, "Incorrect payment amount");
        t.owner = msg.sender;
        t.status = TicketStatus.Sold;
        t.purchasePrice = msg.value;
        ticketsOwnedBy[msg.sender].push(ticketId);
        (bool sent, ) = organizer.call{value: msg.value}("");
        require(sent, "Payment transfer to organizer failed");
        emit TicketPurchased(ticketId, msg.sender, msg.value);
    }

    function transferTicket(uint256 ticketId, address to) external ticketExists(ticketId) eventNotCancelled {
        Ticket storage t = tickets[ticketId];
        require(t.owner == msg.sender, "Only the ticket owner can transfer it");
        require(t.status == TicketStatus.Sold, "Only sold, unused tickets can be transferred");
        require(to != address(0), "Cannot transfer to the zero address");
        require(to != msg.sender, "Cannot transfer to yourself");
        address from = t.owner;
        t.owner = to;
        _removeFromOwnedList(from, ticketId);
        ticketsOwnedBy[to].push(ticketId);
        emit TicketTransferred(ticketId, from, to);
    }

    function validateTicket(uint256 ticketId) external onlyOrganizer ticketExists(ticketId) eventNotCancelled {
        Ticket storage t = tickets[ticketId];
        require(t.status == TicketStatus.Sold, "Ticket is not valid for entry");
        t.status = TicketStatus.Used;
        emit TicketValidated(ticketId, msg.sender);
    }

    function isTicketValid(uint256 ticketId) external view ticketExists(ticketId) returns (bool) {
        return tickets[ticketId].status == TicketStatus.Sold;
    }

    function cancelTicket(uint256 ticketId) external ticketExists(ticketId) eventNotCancelled {
        Ticket storage t = tickets[ticketId];
        require(t.owner == msg.sender, "Only the ticket owner can cancel it");
        require(t.status == TicketStatus.Sold, "Only sold, unused tickets can be cancelled");
        uint256 refundAmount = t.purchasePrice;
        t.status = TicketStatus.Cancelled;
        (bool sent, ) = msg.sender.call{value: refundAmount}("");
        require(sent, "Refund transfer failed");
        emit TicketCancelled(ticketId, msg.sender, refundAmount);
    }

    function cancelEvent() external onlyOrganizer eventNotCancelled {
        eventCancelled = true;
        emit EventCancelledAndRefunded();
    }

    function claimEventRefund(uint256 ticketId) external ticketExists(ticketId) {
        require(eventCancelled, "Event has not been cancelled");
        Ticket storage t = tickets[ticketId];
        require(t.owner == msg.sender, "Only the ticket owner can claim a refund");
        require(t.status == TicketStatus.Sold, "Ticket is not eligible for refund");
        uint256 refundAmount = t.purchasePrice;
        t.status = TicketStatus.Refunded;
        (bool sent, ) = msg.sender.call{value: refundAmount}("");
        require(sent, "Refund transfer failed");
        emit TicketCancelled(ticketId, msg.sender, refundAmount);
    }

    function fundForRefunds() external payable onlyOrganizer {}

    function getTicketsOwnedBy(address ownerAddress) external view returns (uint256[] memory) {
        return ticketsOwnedBy[ownerAddress];
    }

    function getTicket(uint256 ticketId) external view ticketExists(ticketId) returns (Ticket memory) {
        return tickets[ticketId];
    }

    function getAllTickets() external view returns (Ticket[] memory) {
        Ticket[] memory allTickets = new Ticket[](ticketsIssued);
        for (uint256 i = 0; i < ticketsIssued; i++) {
            allTickets[i] = tickets[i];
        }
        return allTickets;
    }

    function _removeFromOwnedList(address ownerAddress, uint256 ticketId) internal {
        uint256[] storage owned = ticketsOwnedBy[ownerAddress];
        for (uint256 i = 0; i < owned.length; i++) {
            if (owned[i] == ticketId) {
                owned[i] = owned[owned.length - 1];
                owned.pop();
                break;
            }
        }
    }
}