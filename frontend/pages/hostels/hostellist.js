import React, { useState, Fragment } from 'react';
import { Button, Modal, Container, Col, Row, Card, Breadcrumb, Form, Pagination } from 'react-bootstrap';
import DataTable from 'react-data-table-component';

// Modal Component for Adding New Hostel
const Modals = ({ onAdd }) => {
    const [lgShow, setLgShow] = useState(false);
    const [hostelName, setHostelName] = useState('');
    const [isActive, setIsActive] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (hostelName) {
            onAdd({ id: Date.now(), hostelName, isActive });
            setHostelName('');
            setIsActive(false);
            setLgShow(false);
        }
    };

    return (
        <Fragment>
            <Button variant="primary" onClick={() => setLgShow(true)} style={{ marginBottom: '1rem' }}>
                Add Hostel
            </Button>

            <Modal size="lg" show={lgShow} onHide={() => setLgShow(false)} aria-labelledby="example-modal-sizes-title-lg">
                <Modal.Header closeButton>
                    <Modal.Title id="example-modal-sizes-title-lg">Add New Hostel</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
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

// Data Table Component
const DataTableComponent = ({ data }) => {
    const columns = [
        { name: 'S.no', selector: (row) => row.id, sortable: true },
        { name: 'Hostel Name', selector: (row) => row.hostelName, sortable: true },
        { name: 'Is Active', selector: (row) => (row.isActive ? 'Yes' : 'No'), sortable: true },
        {
            name: 'Action',
            cell: (row) => (
                <div>
                    <Button variant="info" size="sm" style={{ marginRight: '0.5rem' }} onClick={() => handleView(row)}>View</Button>
                    <Button variant="warning" size="sm" style={{ marginRight: '0.5rem' }} onClick={() => handleEdit(row)}>Edit</Button>
                    <Button variant="danger" size="sm" onClick={() => handleDelete(row.id)}>Delete</Button>
                </div>
            ),
        },
    ];

    const customStyles = {
        headCells: {
            style: {
                fontSize: '15px',
                fontWeight: 'bold',
                backgroundColor: '#f5f5f5',
                borderBottom: '2px solid #007bff',
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
    
    const handlePaginationChange = (page) => {
        setCurrentPage(page);
    };

    const handleView = (row) => {
        alert(`Viewing ${row.hostelName}`);
        // Implement your view logic here
    };

    const handleEdit = (row) => {
        alert(`Editing ${row.hostelName}`);
        // Implement your edit logic here
    };

    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this hostel?")) {
            // Implement your delete logic here
            console.log(`Deleted hostel with ID: ${id}`);
        }
    };

    return (
        <>
            <DataTable
                title="List of Hostel Detail"
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
            />

            <Pagination style={{ marginTop: '1em', float: 'right' }}>
                <Pagination.Prev disabled={currentPage === 1} onClick={() => handlePaginationChange(currentPage - 1)}>Previous</Pagination.Prev>
                {[...Array(totalPages)].map((_, index) => (
                    <Pagination.Item key={index + 1} active={currentPage === index + 1} onClick={() => handlePaginationChange(index + 1)}>
                        {index + 1}
                    </Pagination.Item>
                ))}
                <Pagination.Next disabled={currentPage === totalPages} onClick={() => handlePaginationChange(currentPage + 1)}>Next</Pagination.Next>
            </Pagination>
        </>
    );
};

// Main HostelList Component
const HostelList = () => {
    const [hostels, setHostels] = useState([
        { id: 1, hostelName: 'Hostel A', isActive: true },
        { id: 2, hostelName: 'Hostel B', isActive: false },
        { id: 3, hostelName: 'Hostel C', isActive: true },
        { id: 4, hostelName: 'Hostel D', isActive: false },
        { id: 5, hostelName: 'Hostel E', isActive: true },
        { id: 6, hostelName: 'Hostel F', isActive: false },
        { id: 7, hostelName: 'Hostel G', isActive: false },
        { id: 8, hostelName: 'Hostel H', isActive: false },
        { id: 9, hostelName: 'Hostel I', isActive: false },
        { id: 10, hostelName: 'Hostel J', isActive: false },
        // Add more hostels for testing
        { id: 11, hostelName: 'Hostel K', isActive: true },
        { id: 12, hostelName: 'Hostel L', isActive: false },
        { id: 13, hostelName: 'Hostel M', isActive: true },
        { id: 14, hostelName: 'Hostel N', isActive: false },
        { id: 15, hostelName: 'Hostel O', isActive: true },
        { id: 16, hostelName: 'Hostel P', isActive: false },
        { id: 17, hostelName: 'Hostel Q', isActive: false },
        { id: 18, hostelName: 'Hostel R', isActive: false },
        { id: 19, hostelName: 'Hostel S', isActive: false },
        { id: 20, hostelName: 'Hostel T', isActive: false },
        // Add up to 100 records or more for testing
    ]);

    const handleAddHostel = (newHostel) => {
        setHostels((prev) => [...prev, newHostel]);
    };

    return (
        <Container fluid className="p-6">
            <Row>
                <Col xl={12}>
                    <div className="border-bottom pb-1 mb-2 d-md-flex align-items-center justify-content-between">
                        <div className="d-md-flex align-items-center">
                            <h3 className="mb-0">Hostel Detail</h3>
                        </div>
                        <Modals onAdd={handleAddHostel} />
                    </div>
                    <DataTableComponent data={hostels} />
                </Col>
            </Row>
        </Container>
    );
};

export default HostelList;
