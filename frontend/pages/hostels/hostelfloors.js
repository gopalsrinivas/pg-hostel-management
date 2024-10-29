import React, { useState, Fragment } from 'react';
import { Button, Modal, Container, Col, Row, Form, Pagination } from 'react-bootstrap';
import DataTable from 'react-data-table-component';

// Modal Component for Adding New Hostel Floor
const AddHostelModal = ({ onAdd }) => {
    const [lgShow, setLgShow] = useState(false);
    const [hostelName, setHostelName] = useState('');
    const [hostelFloorName, setHostelFloorName] = useState('');
    const [isActive, setIsActive] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (hostelName && hostelFloorName) {
            onAdd({ id: Date.now(), hostelName, hostelFloorName, isActive });
            // Reset form after submission
            setHostelName('');
            setHostelFloorName('');
            setIsActive(false);
            setLgShow(false);
        }
    };

    return (
        <Fragment>
            <Button variant="primary" onClick={() => setLgShow(true)} style={{ marginBottom: '1rem' }}>
                Add Hostel Floor
            </Button>

            <Modal size="lg" show={lgShow} onHide={() => setLgShow(false)} aria-labelledby="modal-title-lg">
                <Modal.Header closeButton>
                    <Modal.Title id="modal-title-lg">Add New Hostel Floor</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
                        <Row>
                            <Col md={6}>
                                <Form.Group controlId="hostelName">
                                    <Form.Label>Hostel Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter hostel name"
                                        value={hostelName}
                                        onChange={(e) => setHostelName(e.target.value)}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group controlId="hostelFloorName">
                                    <Form.Label>Hostel Floor</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter hostel floor"
                                        value={hostelFloorName}
                                        onChange={(e) => setHostelFloorName(e.target.value)}
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

// Data Table Component for displaying Hostel Floor details
const HostelDataTable = ({ data }) => {
    const columns = [
        { name: 'S.no', selector: (row) => row.id, sortable: true, minWidth: '100px' },
        { name: 'Hostel Name', selector: (row) => row.hostelName, sortable: true, minWidth: '200px' },
        { name: 'Hostel Floor', selector: (row) => row.hostelFloorName, sortable: true, minWidth: '150px' },
        { name: 'Is Active', selector: (row) => (row.isActive ? 'Yes' : 'No'), sortable: true, minWidth: '100px' },
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

    const filteredItems = data.filter(item => item.hostelName.toLowerCase().includes(filterText.toLowerCase()));
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = filteredItems.slice(startIndex, endIndex);

    const handlePaginationChange = (page) => setCurrentPage(page);

    const handleView = (row) => alert(`Viewing ${row.hostelName}`);
    const handleEdit = (row) => alert(`Editing ${row.hostelName}`);
    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this hostel?')) {
            console.log(`Deleted hostel with ID: ${id}`);
        }
    };

    return (
        <>
            <DataTable
                title="List of Hostel Details"
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
                            placeholder="Filter by Hostel Name"
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

// Main HostelFloor Component
const HostelFloor = () => {
    const [hostels, setHostels] = useState([
        { id: 1, hostelName: 'Hostel A', hostelFloorName: 'Floor 1', isActive: true },
        { id: 2, hostelName: 'Hostel B', hostelFloorName: 'Floor 2', isActive: false },
        { id: 3, hostelName: 'Hostel C', hostelFloorName: 'Floor 1', isActive: true },
        { id: 4, hostelName: 'Hostel D', hostelFloorName: 'Floor 3', isActive: true },
        { id: 5, hostelName: 'Hostel E', hostelFloorName: 'Floor 5', isActive: true },
        { id: 6, hostelName: 'Hostel F', hostelFloorName: 'Floor 1', isActive: true },
        { id: 7, hostelName: 'Hostel G', hostelFloorName: 'Floor 2', isActive: true },
        { id: 8, hostelName: 'Hostel H', hostelFloorName: 'Floor 1', isActive: true },
        { id: 9, hostelName: 'Hostel I', hostelFloorName: 'Floor 5', isActive: true },
        { id: 10, hostelName: 'Hostel J', hostelFloorName: 'Floor 1', isActive: true },
        { id: 11, hostelName: 'Hostel K', hostelFloorName: 'Floor 6', isActive: true },
        { id: 12, hostelName: 'Hostel L', hostelFloorName: 'Floor 7', isActive: true },
        { id: 13, hostelName: 'Hostel M', hostelFloorName: 'Floor 1', isActive: true },
    ]);

    const handleAddHostelFloor = (newHostel) => {
        setHostels((prevHostels) => [...prevHostels, newHostel]);
    };

    return (
        <Container fluid className="p-6">
            <Row>
                <Col xl={12}>
                    <div className="d-flex justify-content-between align-items-center border-bottom pb-1 mb-2">
                        <h4 className="mb-0">Hostel Floor</h4>
                        <AddHostelModal onAdd={handleAddHostelFloor} />
                    </div>
                    <HostelDataTable data={hostels} />
                </Col>
            </Row>
        </Container>
    );
};

export default HostelFloor;
