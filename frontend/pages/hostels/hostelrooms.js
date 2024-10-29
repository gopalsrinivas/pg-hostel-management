import React, { useState, Fragment } from 'react';
import { Button, Modal, Container, Col, Row, Form, Pagination } from 'react-bootstrap';
import DataTable from 'react-data-table-component';

// Modal Component for Adding New Hostel Room
const AddRoomModal = ({ onAdd }) => {
    const [lgShow, setLgShow] = useState(false);
    const [roomNumber, setRoomNumber] = useState('');
    const [roomType, setRoomType] = useState('');
    const [isActive, setIsActive] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (roomNumber && roomType) {
            onAdd({ id: Date.now(), roomNumber, roomType, isActive });
            // Reset form after submission
            setRoomNumber('');
            setRoomType('');
            setIsActive(false);
            setLgShow(false);
        }
    };

    return (
        <Fragment>
            <Button variant="primary" onClick={() => setLgShow(true)} style={{ marginBottom: '1rem' }}>
                Add Hostel Room
            </Button>

            <Modal size="lg" show={lgShow} onHide={() => setLgShow(false)} aria-labelledby="modal-title-lg">
                <Modal.Header closeButton>
                    <Modal.Title id="modal-title-lg">Add New Hostel Room</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
                        <Row>
                            <Col md={6}>
                                <Form.Group controlId="roomNumber">
                                    <Form.Label>Room Number</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter room number"
                                        value={roomNumber}
                                        onChange={(e) => setRoomNumber(e.target.value)}
                                        required
                                    />
                                </Form.Group>
                                <Form.Group controlId="roomNumber">
                                    <Form.Label>Room Price</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter room price"
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group controlId="roomType">
                                    <Form.Label>Room Type</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter room type (e.g., Single, Double)"
                                        value={roomType}
                                        onChange={(e) => setRoomType(e.target.value)}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Form.Group controlId="isActive" className="mt-3">
                            <Form.Check
                                type="checkbox"
                                label="Is Active"
                                checked={isActive}
                                onChange={(e) => setIsActive(e.target.checked)}
                            />
                        </Form.Group>

                        <Button variant="primary" type="submit" className="mt-3">
                            Submit
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </Fragment>
    );
};

// Data Table Component for displaying Hostel Room details
const RoomDataTable = ({ data }) => {
    const columns = [
        { name: 'S.no', selector: (row) => row.id, sortable: true, minWidth: '60px' },
        { name: 'Hostel Name', selector: (row) => row.hostelName, sortable: true, minWidth: '120px' },
        { name: 'Hostel Floor', selector: (row) => row.hostelFloor, sortable: true, minWidth: '120px' },
        { name: 'Room Number', selector: (row) => row.roomNumber, sortable: true, minWidth: '100px' },
        { name: 'Room Type', selector: (row) => row.roomType, sortable: true, minWidth: '100px' },
        { name: 'Is Active', selector: (row) => (row.isActive ? 'Yes' : 'No'), sortable: true, minWidth: '80px' },
        {
            name: 'Action',
            cell: (row) => (
                <div>
                    <Button variant="info" size="sm" style={{ marginRight: '0.5rem' }} onClick={() => handleView(row)}>
                        View
                    </Button>
                    <Button variant="warning" size="sm" style={{ marginRight: '0.5rem' }} onClick={() => handleEdit(row)}>
                        Edit
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => handleDelete(row.id)}>
                        Delete
                    </Button>
                </div>
            ),
            minWidth: '200px',
        },
    ];

    const customStyles = {
        headCells: {
            style: {
                fontSize: '15px',
                fontWeight: 'bold',
                backgroundColor: '#f5f5f5',
                borderBottom: '2px solid #007bff',
                borderRight: '1px solid #007bff',
            },
        },
        cells: {
            style: {
                borderBottom: '1px solid #ccc',
                borderRight: '1px solid #ccc',
            },
        },
        table: {
            style: {
                border: '1px solid #ccc',
                borderRadius: '4px',
                overflow: 'hidden',
            },
        },
        footer: {
            style: {
                borderTop: '2px solid #007bff',
            },
        },
    };

    const [filterText, setFilterText] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);
    const totalPages = Math.ceil(data.length / itemsPerPage);

    const filteredItems = data.filter(item => item.roomNumber.toLowerCase().includes(filterText.toLowerCase()));
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = filteredItems.slice(startIndex, endIndex);

    const handlePaginationChange = (page) => setCurrentPage(page);

    const handleView = (row) => alert(`Viewing ${row.roomNumber}`);
    const handleEdit = (row) => alert(`Editing ${row.roomNumber}`);
    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this room?')) {
            console.log(`Deleted room with ID: ${id}`);
        }
    };

    return (
        <>
            <DataTable
                title="List of Hostel Rooms"
                columns={columns}
                data={currentItems}
                pagination={false}
                highlightOnHover
                selectableRows
                fixedHeader
                fixedHeaderScrollHeight="400px"
                subHeader
                subHeaderComponent={
                    <>
                        <input
                            type="text"
                            placeholder="Filter by Room Number"
                            value={filterText}
                            onChange={(e) => setFilterText(e.target.value)}
                            style={{ width: '300px', marginLeft: '10px' }}
                        />
                        <select
                            value={itemsPerPage}
                            onChange={(e) => {
                                setItemsPerPage(Number(e.target.value));
                                setCurrentPage(1);
                            }}
                            style={{ marginLeft: '10px' }}
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                            <option value={150}>150</option>
                            <option value={200}>200</option>
                        </select>
                    </>
                }
                customStyles={customStyles}
                responsive={true}
                overflowX="auto"
            />

            <Pagination style={{ marginTop: '1em', float: 'right' }}>
                <Pagination.Prev disabled={currentPage === 1} onClick={() => handlePaginationChange(currentPage - 1)}>
                    Previous
                </Pagination.Prev>
                {[...Array(totalPages)].map((_, index) => (
                    <Pagination.Item key={index + 1} active={currentPage === index + 1} onClick={() => handlePaginationChange(index + 1)}>
                        {index + 1}
                    </Pagination.Item>
                ))}
                <Pagination.Next disabled={currentPage === totalPages} onClick={() => handlePaginationChange(currentPage + 1)}>
                    Next
                </Pagination.Next>
            </Pagination>
        </>
    );
};

// Main HostelRoom Component
const HostelRoom = () => {
    const [rooms, setRooms] = useState([
        { id: 1, hostelName: 'Hostel A', hostelFloor:'Floor 1', roomNumber: '101', roomType: 'Single', isActive: true },
        { id: 2, hostelName: 'Hostel B', hostelFloor: 'Floor 3', roomNumber: '102', roomType: 'Double', isActive: false },
        { id: 3, hostelName: 'Hostel C', hostelFloor: 'Floor 2', roomNumber: '103', roomType: 'Single', isActive: true },
        { id: 4, hostelName: 'Hostel D', hostelFloor: 'Floor 1', roomNumber: '104', roomType: 'Triple', isActive: true },
        { id: 5, hostelName: 'Hostel E', hostelFloor: 'Floor 3', roomNumber: '105', roomType: 'Quad', isActive: true },
        { id: 6, hostelName: 'Hostel F', hostelFloor: 'Floor 5', roomNumber: '106', roomType: 'Double', isActive: true },
        { id: 7, hostelName: 'Hostel G', hostelFloor: 'Floor 6', roomNumber: '107', roomType: 'Single', isActive: true },
        { id: 8, hostelName: 'Hostel H', hostelFloor: 'Floor 2', roomNumber: '108', roomType: 'Double', isActive: true },
        { id: 9, hostelName: 'Hostel I', hostelFloor: 'Floor 7', roomNumber: '109', roomType: 'Single', isActive: true },
        { id: 10, hostelName: 'Hostel J', hostelFloor: 'Floor 6', roomNumber: '110', roomType: 'Triple', isActive: false },
    ]);

    const handleAddRoom = (newRoom) => {
        setRooms((prevRooms) => [...prevRooms, newRoom]);
    };

    return (
        <Container fluid className="p-6">
            <Row>
                <Col xl={12}>
                    <div className="d-flex justify-content-between align-items-center border-bottom pb-1 mb-2">
                        <h4 className="mb-0">Hostel Rooms</h4>
                        <AddRoomModal onAdd={handleAddRoom} />
                    </div>
                    <RoomDataTable data={rooms} />
                </Col>
            </Row>
        </Container>
    );
};

export default HostelRoom;
