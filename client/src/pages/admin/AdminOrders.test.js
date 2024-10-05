import React from 'react'
import {render, waitFor, screen, fireEvent} from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import '@testing-library/jest-dom/extend-expect'
import AdminOrders from './AdminOrders';
import axios from "axios";
import moment from "moment";
import userEvent from "@testing-library/user-event";
import {useAuth} from "../../context/auth";

jest.mock('axios')
jest.mock('react-hot-toast')

jest.mock('moment', () => {
    return jest.fn(() => ({
        fromNow: jest.fn(() => '1 Hour Ago')
    }));
});

jest.mock("../../components/Layout", () => ({ children, title }) => (
        <div>
            <title>
                {title}
            </title>
            <main>
                {children}
            </main>
        </div>
    )
);

jest.mock('../../context/auth', () => ({
    useAuth: jest.fn(() => [null, jest.fn()]) // Mock useAuth hook to return null state and a mock function for setAuth
}));

describe('Admin Orders Component', () => {

    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(global.console, 'log').mockImplementation(() => {});
    })

    afterEach(() => {
        console.log.mockRestore();
    });


    it('does not render any table with 0 orders', async () => {
        useAuth.mockReturnValue([{
            token: '123'
        }]);

        axios.get.mockResolvedValue({
            data: []
        });

        render(
            <MemoryRouter initialEntries={['/admin/orders']}>
                <Routes>
                    <Route path="/admin/orders" element={<AdminOrders />} />
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByText('All Orders')).toBeInTheDocument();
        expect(screen.queryByText('#')).not.toBeInTheDocument();
        expect(screen.queryByText('Status')).not.toBeInTheDocument();
        expect(screen.queryByText('Buyer')).not.toBeInTheDocument();
        expect(screen.queryByText('Date')).not.toBeInTheDocument();
        expect(screen.queryByText('Payment')).not.toBeInTheDocument();
        expect(screen.queryByText('Quantity')).not.toBeInTheDocument();
    })

    it('renders order table correctly with 1 failed and 1 success order', async () => {
        useAuth.mockReturnValue([{
            token: '123'
        }]);

        axios.get.mockResolvedValue({
            data: [
                {
                    "products": [
                        {
                            "_id": "1",
                            "name": "Shoes",
                            "description": "Classic shoes",
                            "price": 99.99
                        }
                    ],
                    "payment": {
                        "success": false
                    },
                    "buyer": {
                        "name": "John Doe"
                    },
                    "status": "Not Process",
                    "createdAt": "2024-09-14T08:26:06.070Z"
                },
                {
                    "products": [
                        {
                            "_id": "2",
                            "name": "Jeans",
                            "description": "Classic denim jeans",
                            "price": 49.99
                        },
                        {
                            "_id": "3",
                            "name": "Shirt",
                            "description": "Classic t-shirt",
                            "price": 9.99
                        }
                    ],
                    "payment": {
                        "success": true
                    },
                    "buyer": {
                        "name": "Doe John"
                    },
                    "status": "Processed",
                    "createdAt": "2024-09-15T08:26:06.070Z"
                }
            ]
        });

        render(
            <MemoryRouter initialEntries={['/admin/orders']}>
                <Routes>
                    <Route path="/admin/orders" element={<AdminOrders />} />
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByText('All Orders')).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getAllByText('#')).toHaveLength(2);
            expect(screen.getAllByText('Status')).toHaveLength(2);
            expect(screen.getAllByText('Buyer')).toHaveLength(2);
            expect(screen.getAllByText('Date')).toHaveLength(2);
            expect(screen.getAllByText('Payment')).toHaveLength(2);
            expect(screen.getAllByText('Quantity')).toHaveLength(2);

            expect(screen.getAllByText('1')).toHaveLength(2);
            expect(screen.getAllByText('1 Hour Ago')).toHaveLength(2);
            expect(screen.getByText('Not Process')).toBeInTheDocument();
            expect(screen.getByText('John Doe')).toBeInTheDocument();
            expect(screen.getByText('Failed')).toBeInTheDocument();
            expect(screen.getByText('Shoes')).toBeInTheDocument();
            expect(screen.getByText('Classic shoes')).toBeInTheDocument();
            expect(screen.getByText('Price : 99.99')).toBeInTheDocument();

            expect(screen.getAllByText('2')).toHaveLength(2);
            expect(screen.getByText('Processed')).toBeInTheDocument();
            expect(screen.getByText('Doe John')).toBeInTheDocument();
            expect(screen.getByText('Success')).toBeInTheDocument();
            expect(screen.getByText('Jeans')).toBeInTheDocument();
            expect(screen.getByText('Classic denim jeans')).toBeInTheDocument();
            expect(screen.getByText('Price : 49.99')).toBeInTheDocument();
            expect(screen.getByText('Shirt')).toBeInTheDocument();
            expect(screen.getByText('Classic t-shirt')).toBeInTheDocument();
            expect(screen.getByText('Price : 9.99')).toBeInTheDocument();

            expect(moment).toHaveBeenCalledWith("2024-09-14T08:26:06.070Z");
            expect(moment).toHaveBeenCalledWith("2024-09-15T08:26:06.070Z");
        });
    });

    it('console logs http errors', async () => {
        useAuth.mockReturnValue([{
            token: '123'
        }]);

        axios.get.mockRejectedValue(
            new Error('Mock Error')
        );

        render(
            <MemoryRouter initialEntries={['/admin/orders']}>
                <Routes>
                    <Route path="/admin/orders" element={<AdminOrders />} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(console.log).toHaveBeenCalledWith(new Error('Mock Error'));
        });
    });

    it('check if all status is available in dropdown selection', async () => {
        useAuth.mockReturnValue([{
            token: '123'
        }]);

        axios.get.mockResolvedValue({
            data: [
                {
                    _id: '1',
                    products: [
                        {
                            _id: '1',
                            name: 'Shoes',
                            description: 'Classic shoes',
                            price: 99.99,
                        },
                    ],
                    payment: {
                        success: false,
                    },
                    buyer: {
                        name: 'John Doe',
                    },
                    status: 'Mock Status',
                    createdAt: '2024-09-14T08:26:06.070Z',
                },
            ],
        });

        render(
            <MemoryRouter initialEntries={['/admin/orders']}>
                <Routes>
                    <Route path="/admin/orders" element={<AdminOrders />} />
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByText('All Orders')).toBeInTheDocument();

        await waitFor(() => {
            const select = screen.getByRole('combobox');
            userEvent.click(select);
        });

        await waitFor(() => {
            expect(screen.getByTitle('Not Process')).toBeInTheDocument();
            expect(screen.getByTitle('Shipped')).toBeInTheDocument();
            expect(screen.getByTitle('Processing')).toBeInTheDocument();
            expect(screen.getByTitle('Delivered')).toBeInTheDocument();
            expect(screen.getByTitle('Cancel')).toBeInTheDocument();
        });
    });

    it('changes order status', async () => {
        useAuth.mockReturnValue([{
            token: '123'
        }]);

        axios.get.mockResolvedValue({
            data: [
                {
                    _id: '1',
                    products: [
                        {
                            _id: '1',
                            name: 'Shoes',
                            description: 'Classic shoes',
                            price: 99.99,
                        },
                    ],
                    payment: {
                        success: false,
                    },
                    buyer: {
                        name: 'John Doe',
                    },
                    status: 'Mock Status',
                    createdAt: '2024-09-14T08:26:06.070Z',
                },
            ],
        });

        axios.put.mockResolvedValue({
            data: {
                status: 'New Status',
            },
        });

        render(
            <MemoryRouter initialEntries={['/admin/orders']}>
                <Routes>
                    <Route path="/admin/orders" element={<AdminOrders />} />
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByText('All Orders')).toBeInTheDocument();

        await waitFor(() => {
            const select = screen.getByRole('combobox');
            userEvent.click(select);
        });

        await waitFor(() => {
            userEvent.click(screen.getByTitle('Shipped'));
        });

        expect(axios.put).toHaveBeenCalledWith('/api/v1/auth/order-status/1', {
            status: 'Shipped',
        });
    });

    it('console logs failed update of order status', async () => {
        useAuth.mockReturnValue([{
            token: '123'
        }]);

        axios.get.mockResolvedValue({
            data: [
                {
                    _id: '1',
                    products: [
                        {
                            _id: '1',
                            name: 'Shoes',
                            description: 'Classic shoes',
                            price: 99.99,
                        },
                    ],
                    payment: {
                        success: false,
                    },
                    buyer: {
                        name: 'John Doe',
                    },
                    status: 'Mock Status',
                    createdAt: '2024-09-14T08:26:06.070Z',
                },
            ],
        });

        axios.put.mockRejectedValue('Mock Error');

        render(
            <MemoryRouter initialEntries={['/admin/orders']}>
                <Routes>
                    <Route path="/admin/orders" element={<AdminOrders />} />
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByText('All Orders')).toBeInTheDocument();

        await waitFor(() => {
            const select = screen.getByRole('combobox');
            userEvent.click(select);
        });

        await waitFor(() => {
            userEvent.click(screen.getByTitle('Shipped'));
        });

        expect(console.log).toHaveBeenCalledWith('Mock Error');
    });

    it('should not call getOrders if token is null', async () => {
        useAuth.mockReturnValue([{
            token: null
        }]);

        render(
            <MemoryRouter initialEntries={['/admin/orders']}>
                <Routes>
                    <Route path="/admin/orders" element={<AdminOrders />} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(axios.get).not.toHaveBeenCalled();
        });
    });
});
