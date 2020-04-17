module.exports =
{
  service: {
    uuid: '1AD1BF10-EFB7-595A-8AEC-F7C41C694ABA'
  },
  characteristics: {
    //authentication:
    secure_key: {
      uuid: '1AD1BF13-EFB7-595A-8AEC-F7C41C694ABA',
      size: 32
    },
    nonce: {
      uuid: '1AD1BF14-EFB7-595A-8AEC-F7C41C694ABA',
      size: 32
    },
    signature: {
      uuid: '1AD1BF12-EFB7-595A-8AEC-F7C41C694ABA',
      size: 64
    },
    mac: {
      uuid: '1AD1BF11-EFB7-595A-8AEC-F7C41C694ABA',
      size: 20
    },
  //operation:
    state: {
      uuid: '1AD1BF15-EFB7-595A-8AEC-F7C41C694ABA',
      size: 1
    },
    type: {
      uuid: '1AD1BF16-EFB7-595A-8AEC-F7C41C694ABA',
      size: 1
    },
    parameter: {
      uuid: '1AD1BF17-EFB7-595A-8AEC-F7C41C694ABA',
      size: 248
    }
  },
  state: {
    idle: 0,
    established: 1,
    initial: 2,
    connected: 3,
    succeed: 4,
    unsuccessful: 5,
    pending: 6
  }
};