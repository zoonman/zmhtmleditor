<?php
/**
 * Html editor upload
 * server.php
 *
 * PHP Version 5
 *
 * @category Production
 * @package  Default
 * @author   Philipp Tkachev <zoonman@gmail.com>
 * @date     1/1/15 5:46 PM
 * @license  http://marketmesuite.com/license.txt MMS License
 * @version  GIT: 1.0
 * @link     http://marketmesuite.com/
 */

header('Content-Type: application/json');

// make this directory writable to your server
$uploadDirectory = 'files/';
$results = array();
if (!empty($_FILES)) {
    foreach($_FILES as $file) {
        // server path
        $targetFilePath = $uploadDirectory . basename($file['name']);
        // file url, can be absolute or something else
        $targetFileUrl = $uploadDirectory . basename($file['name']);
        $results[] = array(
            'result' => move_uploaded_file($file['tmp_name'], $targetFilePath),
            'name' => $file['name'],
            'type' => $file['type'],
            'url' => $targetFileUrl
        );
    }
}

echo json_encode($results);
