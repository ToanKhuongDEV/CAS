ALTER TABLE stores
    ADD COLUMN latitude DECIMAL(10, 8) NULL AFTER google_maps_location,
    ADD COLUMN longitude DECIMAL(11, 8) NULL AFTER latitude;
