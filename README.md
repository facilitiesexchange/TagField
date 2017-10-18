## TagField

For use with ExtJS 6.x Modern

![enter image description here](https://media.giphy.com/media/l4EoV9askhGagEbq8/giphy.gif)

## Usage

Download the class and include it somewhere in your app.

Simple Use Case:

    {
            xtype: 'tagfield',
            multiSelect: true,
            displayField: 'name',
            valueField: 'id',
            label: 'Test Field',
            store: Ext.create( 'Ext.data.Store', {
                data: [
                {
                    id: 1,
                    name: 'Sally'
                },
                {
                    id: 2,
                    name: 'Booger'
                },
                {
                    id: 3,
                    name: 'Brando'
                }
                ]
            } )
    }

## Author

Created by Brandon Ryall-Ortiz from Facilities Exchange

MIT License

## Contribute

If you would like to contribute to the project please follow the directions below.

 1. Fork the project
 2. Make your changes and commit them
 3. Create a pull request



