#!/usr/bin/env bash
cd "$(dirname "$0")/../.." || exit 1
source tests/phase1/lib.sh

cols() {
  mysql_exec "SELECT GROUP_CONCAT(column_name ORDER BY ordinal_position) FROM information_schema.columns WHERE table_schema='frankenstein' AND table_name='$1'"
}
dtype() {
  mysql_exec "SELECT data_type FROM information_schema.columns WHERE table_schema='frankenstein' AND table_name='$1' AND column_name='$2'"
}

assert_eq "$(mysql_exec "SELECT GROUP_CONCAT(table_name ORDER BY table_name) FROM information_schema.tables WHERE table_schema='frankenstein'")" \
  "order_items,orders,products,users,venues" "table list"

assert_eq "$(mysql_exec "SELECT COUNT(*) FROM information_schema.referential_constraints WHERE constraint_schema='frankenstein'")" 0 "no foreign keys"

# Inconsistent naming and timestamps, exactly as designed
assert_eq "$(cols users)"       "id,email,name,password_plaintext,password_md5,created_at" "users columns"
assert_eq "$(cols products)"    "ID,ProductName,Description,Price,ImageUrl" "products columns (PascalCase, no timestamp)"
assert_eq "$(cols orders)"      "order_id,user_id,status,total,created_at" "orders columns (no updated_at)"
assert_eq "$(cols order_items)" "item_id,orderId,product_id,quantity,price" "order_items columns (orderId vs order_id)"
assert_eq "$(cols venues)"      "id,name,layout_json" "venues columns"

# Money is DECIMAL (FLOAT is deferred to Phase 6); venue layout is a JSON blob
assert_eq "$(dtype products Price)"  decimal "products.Price type"
assert_eq "$(dtype orders total)"    decimal "orders.total type"
assert_eq "$(dtype order_items price)" decimal "order_items.price type"
assert_eq "$(dtype venues layout_json)" json "venues.layout_json type"

# Seed data, including the dual password scheme
assert_eq "$(mysql_exec "SELECT COUNT(*) FROM users")" 5 "user count"
assert_eq "$(mysql_exec "SELECT COUNT(*) FROM users WHERE password_plaintext IS NOT NULL AND password_md5 IS NULL")" 2 "plaintext-only users"
assert_eq "$(mysql_exec "SELECT COUNT(*) FROM users WHERE password_md5 IS NOT NULL AND password_plaintext IS NULL")" 3 "md5-only users"
assert_eq "$(mysql_exec "SELECT COUNT(*) FROM products")" 6 "product count"
assert_eq "$(mysql_exec "SELECT COUNT(*) FROM orders")" 2 "order count"
assert_eq "$(mysql_exec "SELECT COUNT(*) FROM order_items")" 3 "order item count"
assert_eq "$(mysql_exec "SELECT COUNT(*) FROM venues")" 1 "venue count"

docker network inspect frankenstein-net >/dev/null 2>&1 || fail "network frankenstein-net missing"
echo "PASS: db"
