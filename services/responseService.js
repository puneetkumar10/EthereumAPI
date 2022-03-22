module.exports.response = (req, err, data, res) => {
    if (err)
        res.status(200).json({ status: 0, message: err, data: {} });
    else {
        res.status(200).json({ status: 1, message: 'Success', data: data });
    }
};