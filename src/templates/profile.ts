export const profile: IComponents = {
  root: {
    id: 'root',
    parent: 'root',
    type: 'Box',
    children: ['comp-root'],
    props: {
      backgroundColor: '#f3f3f3',
    },
  },
  'comp-root': {
    id: 'comp-root',
    type: 'Box',
    props: {
      backgroundColor: 'white',
      borderRadius: 'md',
      boxShadow: 'md',
      padding: '4',
    },
    parent: 'root',
    children: ['profileImage', 'profileInfo'],
  },
  profileImage: {
    id: 'profileImage',
    type: 'Image',
    props: {
      src: 'https://dummyimage.com/200x200/ccc/000',
      alt: 'Profile Image',
      objectFit: 'cover',
      width: '200px',
      height: '200px',
      borderRadius: 'full',
    },
    parent: 'comp-root',
    children: [],
  },
  profileInfo: {
    id: 'profileInfo',
    type: 'Box',
    props: {
      marginTop: '4',
    },
    parent: 'comp-root',
    children: ['profileName', 'profileBio'],
  },
  profileName: {
    id: 'profileName',
    type: 'Text',
    props: {
      fontWeight: 'bold',
      fontSize: 'lg',
    },
    parent: 'profileInfo',
    children: ['John Doe'],
  },
  profileBio: {
    id: 'profileBio',
    type: 'Text',
    props: {
      color: 'gray.600',
      fontSize: 'sm',
    },
    parent: 'profileInfo',
    children: ['Software Engineer'],
  },
}
