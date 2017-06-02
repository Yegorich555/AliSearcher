using System;
using System.ComponentModel;
using System.ComponentModel.Design.Serialization;
using System.Globalization;
using System.Linq;

namespace Engine.Entity
{
    [TypeConverter(typeof(SubFloatConverter))]
    public struct SubFloat : IComparable<SubFloat>
    {
        public const int pow = 100; // for x dig after point
        const string formatDecimal = "D2";
        int value;

        public SubFloat(int v)
        {
            value = v * pow;
        }

        public SubFloat(float v)
        {
            value = Convert.ToInt32(v * pow);
        }

        public SubFloat(string text) : this()
        {
            if (string.IsNullOrEmpty(text))
            {
                value = 0;
                return;
            }
            if (text.IsEqual("max"))
            {
                value = int.MaxValue;
                return;
            }
            var arr = text.Split('.', ',');
            int.TryParse(arr[0], out int v1);
            value = v1 * pow;
            if (arr.Length > 1)
            {
                var tmp = arr[1];
                if (tmp.Length < 2)
                    tmp = tmp.Insert(tmp.Length, new string('0', 2 - tmp.Length));
                int.TryParse(tmp, out int v2);
                value += v2;
            }
        }

        public static implicit operator SubFloat(int v)
        {
            return new SubFloat { value = v };
        }

        public static implicit operator int(SubFloat v)
        {
            return v.value;
        }


        public override string ToString()
        {
            int val1 = value / pow;
            return val1.ToString() +
                CultureInfo.CurrentCulture.NumberFormat.NumberDecimalSeparator[0] +
                ((int)(value - val1 * pow)).ToString(formatDecimal);
        }

        public int CompareTo(SubFloat obj)
        {
            if (this > obj)
                return 1;
            if (this < obj)
                return -1;
            else
                return 0;
        }
    }

    internal class SubFloatConverter : TypeConverter
    {
        public override bool CanConvertFrom(ITypeDescriptorContext context, Type sourceType)
        {
            if (sourceType == typeof(string) || sourceType == typeof(float))
                return true;
            return base.CanConvertFrom(context, sourceType);
        }

        public override bool CanConvertTo(ITypeDescriptorContext context, Type destinationType)
        {
            if (destinationType == typeof(InstanceDescriptor))
                return true;
            return base.CanConvertTo(context, destinationType);
        }

        public override object ConvertFrom(ITypeDescriptorContext context, CultureInfo culture, object value)
        {
            if (value == null)
                return base.ConvertFrom(context, culture, value);
            var type = value.GetType();
            if (type == typeof(string))
                return new SubFloat(value as string);
            if (type == typeof(float))
                return new SubFloat((float)value);
            return base.ConvertFrom(context, culture, value);
        }

        public override object ConvertTo(ITypeDescriptorContext context, CultureInfo culture, object value, Type destinationType)
        {
            if (value is SubFloat? && destinationType == typeof(string))
                return value.ToString();

            return base.ConvertTo(context, culture, value, destinationType);
        }
    }
}
