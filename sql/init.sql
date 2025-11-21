CREATE DATABASE DemoDB;

USE DemoDB;

CREATE TABLE Customers (
    CustomerID INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(50),
    Email NVARCHAR(50)
);

INSERT INTO Customers (Name, Email) VALUES
('Alice', 'alice@example.com'),
('Bob', 'bob@example.com');
