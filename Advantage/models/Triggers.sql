--On NEW Request?
DELIMITER $$

CREATE TRIGGER onAddRequest
    BEFORE INSERT ON requests
    FOR EACH ROW
BEGIN
    IF EXISTS (SELECT SoldTo FROM products WHERE ProductId = NEW.ProductId AND SoldTo IS NOT NULL) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Product is already Sold cannot make request';
    END IF;
END$$

DELIMITER ;
--Request Accepted?
DELIMITER $$

CREATE TRIGGER onAcceptRequest
    AFTER UPDATE ON products
    FOR EACH ROW
BEGIN
    IF NEW.SoldTo != OLD.SoldTo THEN
    DELETE FROM requests WHERE EXISTS (SELECT SoldTo FROM products WHERE ProductId = requests.ProductId AND SoldTo IS NOT NULL);
    END IF;
END$$

DELIMITER ;