export default (value: string) => {
	let channelID = '';
	const channelRegex = /<#[0-9]{18,19}>/;
	const numberRegex = /[0-9]{18,19}/;
	if (channelRegex.test(value)) {
		const valueArr = value.split('');
		valueArr.pop();
		valueArr.shift();
		valueArr.shift();
		channelID = valueArr.join('');
	}
	else if (numberRegex.test(value)) {
		channelID = value;
	}
	return channelID;
};
