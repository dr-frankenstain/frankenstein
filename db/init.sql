-- Fake data only. Nothing here is real.
SET NAMES utf8mb4;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  password_plaintext VARCHAR(255) NULL,
  password_md5 CHAR(32) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
  ID INT AUTO_INCREMENT PRIMARY KEY,
  ProductName VARCHAR(255) NOT NULL,
  Description TEXT,
  Price DECIMAL(10,2) NOT NULL,
  ImageUrl VARCHAR(255)
);

CREATE TABLE orders (
  order_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  status VARCHAR(32) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_items (
  item_id INT AUTO_INCREMENT PRIMARY KEY,
  orderId INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  price DECIMAL(10,2) NOT NULL
);

CREATE TABLE venues (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  layout_json JSON NOT NULL
);

-- Legacy rows kept plaintext passwords; newer rows moved to unsalted MD5.
INSERT INTO users (email, name, password_plaintext, password_md5) VALUES
  ('victor@example.test',    'Victor',    'password123', NULL),
  ('igor@example.test',      'Igor',      'hunchback',   NULL),
  ('elizabeth@example.test', 'Elizabeth', NULL, MD5('lightning')),
  ('henry@example.test',     'Henry',     NULL, MD5('graveyard')),
  ('justine@example.test',   'Justine',   NULL, MD5('electricity'));

INSERT INTO products (ProductName, Description, Price, ImageUrl) VALUES
  ('Neck Bolts',        'Sold in pairs. Pairs not guaranteed.',      9.99, '/img/neck-bolts.png'),
  ('Lightning Rod',     'Some assembly required. Storm not included.', 49.99, '/img/lightning-rod.png'),
  ('Brain Jar',         'Dishwasher safe. Brain sold separately.',   29.99, '/img/brain-jar.png'),
  ('Torch',             'For angry mobs of any size.',               14.50, '/img/torch.png'),
  ('Stitching Kit',     'Thread, needle, and optimism.',             12.00, '/img/stitching-kit.png'),
  ('Spare Parts Crate', 'Contents may be lively.',                   99.00, '/img/spare-parts.png');

INSERT INTO orders (user_id, status, total) VALUES
  (1, 'shipped', 69.97),
  (3, 'pending', 14.50);

INSERT INTO order_items (orderId, product_id, quantity, price) VALUES
  (1, 1, 2, 9.99),
  (1, 2, 1, 49.99),
  (2, 4, 1, 14.50);

INSERT INTO venues (name, layout_json) VALUES
  ('Ye Olde Opera House', JSON_OBJECT(
    'sections', JSON_ARRAY(JSON_OBJECT('name', 'A', 'rows', 2, 'seatsPerRow', 4)),
    'seats', JSON_ARRAY('A1-1','A1-2','A1-3','A1-4','A2-1','A2-2','A2-3','A2-4')
  ));
