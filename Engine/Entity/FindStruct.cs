using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Engine.Entity
{
    public struct FindStruct
    {
        public FindStruct(string text, int startIndex)
        {
            Text = text;
            StartIndex = startIndex;
            NotOk = false;
        }
        public string Text { get; set; }
        public int StartIndex { get; set; }
        public bool NotOk { get; set; }


        public override string ToString()
        {
            return StartIndex.ToString() + "; " + Text;
        }
    }
}
